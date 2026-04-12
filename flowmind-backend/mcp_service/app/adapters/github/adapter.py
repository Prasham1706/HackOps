from typing import Any, Dict, Optional

import httpx

from app.adapters.base import ServiceAdapter
from app.core.config import settings
from app.core.exceptions import AdapterExecutionError


class GitHubAdapter(ServiceAdapter):
    service_name = "github"
    base_url = "https://api.github.com"

    async def execute(
        self,
        action: str,
        inputs: Dict[str, Any],
        user_tokens: Optional[Dict[str, Dict[str, Any]]] = None,
    ) -> Any:
        token = self._resolve_token(user_tokens)
        repo = inputs.get("repo") or settings.GITHUB_DEFAULT_REPO
        if not repo:
            raise AdapterExecutionError("GitHub actions require inputs.repo or GITHUB_DEFAULT_REPO", 400)

        if action == "listen_issue":
            return await self._listen_issue(repo, token)
        if action == "create_issue":
            return await self._create_issue(repo, inputs, token)
        if action == "comment":
            return await self._comment(repo, inputs, token)
        raise AdapterExecutionError(f"Unsupported GitHub action '{action}'", 400)

    async def _listen_issue(self, repo: str, token: str) -> str:
        issues = await self._request_with_public_fallback("GET", f"/repos/{repo}/issues", token, params={
            "state": "open",
            "sort": "created",
            "direction": "desc",
            "per_page": 10,
        })
        # Note: GitHub API returns PRs in the issue endpoint too
        issue = next((item for item in issues if "pull_request" not in item), None)
        
        if not issue:
            # Fallback to commits if no open issues are found
            return await self._listen_commits(repo, token)
            
        title = issue.get("title", "").strip()
        body = issue.get("body", "").strip()
        return f"Latest Issue #{issue['number']}: {title}\n\n{body}".strip()

    async def _listen_commits(self, repo: str, token: str) -> str:
        commits = await self._request_with_public_fallback("GET", f"/repos/{repo}/commits", token, params={
            "per_page": 5,
        })
        if not commits:
            raise AdapterExecutionError(f"No repository activity (issues or commits) found for '{repo}'", 404)
        
        latest = commits[0]
        author = latest.get("commit", {}).get("author", {}).get("name", "Unknown")
        # Extract date from '2026-04-11T12:34:56Z' -> '2026-04-11'
        date_raw = latest.get("commit", {}).get("author", {}).get("date", "Unknown Date")
        date = date_raw.split("T")[0] if "T" in date_raw else date_raw
        message = latest.get("commit", {}).get("message", "").strip()
        
        return f"Latest Repository Update (Commit):\nAuthor: {author}\nDate: {date}\n\nMessage: {message}".strip()

    async def _create_issue(self, repo: str, inputs: Dict[str, Any], token: str) -> str:
        title = str(inputs.get("title", "")).strip()
        body = str(inputs.get("body", "")).strip()
        if not title:
            raise AdapterExecutionError("GitHub create_issue requires inputs.title", 400)
        try:
            created = await self._request("POST", f"/repos/{repo}/issues", token, json={
                "title": title,
                "body": body,
            })
            return f"Created GitHub issue #{created['number']}: {created['html_url']}"
        except AdapterExecutionError as exc:
            detail = exc.message.lower()
            if exc.status_code == 403 and "resource not accessible by personal access token" in detail:
                fallback_body = body or title
                fallback = await self._comment_on_latest_issue(repo, fallback_body, token)
                return (
                    "GitHub issue creation was blocked by token permissions. "
                    f"Fallback applied successfully: {fallback}"
                )
            raise

    async def _comment(self, repo: str, inputs: Dict[str, Any], token: str) -> str:
        issue_number = inputs.get("issue_number")
        body = str(inputs.get("body", "")).strip()
        if not issue_number:
            raise AdapterExecutionError("GitHub comment requires inputs.issue_number", 400)
        if not body:
            raise AdapterExecutionError("GitHub comment requires inputs.body", 400)
        comment = await self._request(
            "POST",
            f"/repos/{repo}/issues/{issue_number}/comments",
            token,
            json={"body": body},
        )
        return f"Comment posted: {comment['html_url']}"

    async def _comment_on_latest_issue(self, repo: str, body: str, token: str) -> str:
        if not body:
            raise AdapterExecutionError("GitHub fallback comment requires non-empty body", 400)

        issues = await self._request_with_public_fallback("GET", f"/repos/{repo}/issues", token, params={
            "state": "open",
            "sort": "created",
            "direction": "desc",
            "per_page": 10,
        })
        issue = next((item for item in issues if "pull_request" not in item), None)
        if not issue:
            raise AdapterExecutionError(
                "GitHub token cannot create issues and no open issue exists for fallback commenting",
                403,
            )

        comment = await self._request(
            "POST",
            f"/repos/{repo}/issues/{issue['number']}/comments",
            token,
            json={"body": body},
        )
        return f"commented on issue #{issue['number']}: {comment['html_url']}"

    async def _request_with_public_fallback(self, method: str, path: str, token: str, **kwargs: Any) -> Any:
        try:
            return await self._request(method, path, token, **kwargs)
        except AdapterExecutionError as exc:
            detail = exc.message.lower()
            if method.upper() == "GET" and exc.status_code in {401, 403}:
                if any(marker in detail for marker in [
                    "resource not accessible by personal access token",
                    "bad credentials",
                    "requires authentication",
                    "forbidden",
                ]):
                    return await self._request(method, path, "", **kwargs)
            raise

    async def _request(self, method: str, path: str, token: str, **kwargs: Any) -> Any:
        headers = {
            "Accept": "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
        }
        if token:
            headers["Authorization"] = f"Bearer {token}"
        try:
            async with httpx.AsyncClient(
                base_url=self.base_url,
                timeout=settings.MCP_REQUEST_TIMEOUT,
                trust_env=False,
            ) as client:
                response = await client.request(method, path, headers=headers, **kwargs)
                response.raise_for_status()
                return response.json()
        except httpx.HTTPStatusError as exc:
            detail = exc.response.text or str(exc)
            raise AdapterExecutionError(f"GitHub API error: {detail}", exc.response.status_code) from exc
        except httpx.HTTPError as exc:
            raise AdapterExecutionError(f"GitHub API request failed: {exc}", 502) from exc

    @staticmethod
    def _resolve_token(user_tokens: Optional[Dict[str, Dict[str, Any]]]) -> str:
        token = ""
        if user_tokens:
            token = str(user_tokens.get("github", {}).get("access_token", "")).strip()
        token = token or settings.GITHUB_TOKEN
        return token
