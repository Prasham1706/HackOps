class MCPError(Exception):
    def __init__(self, message: str, status_code: int = 500) -> None:
        self.message = message
        self.status_code = status_code
        super().__init__(message)


class AdapterExecutionError(MCPError):
    pass


class ConfigurationError(MCPError):
    pass

