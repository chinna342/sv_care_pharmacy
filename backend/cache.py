import time
from typing import Any, Dict, Optional, Tuple

class SimpleCache:
    """
    High-performance in-memory cache with TTL and namespace invalidation.
    Can be seamlessly backed by Redis in multi-instance production deployments.
    """
    def __init__(self):
        self._store: Dict[str, Tuple[Any, float]] = {}

    def get(self, key: str) -> Optional[Any]:
        if key in self._store:
            value, expires_at = self._store[key]
            if expires_at is None or expires_at > time.time():
                return value
            # Expired
            del self._store[key]
        return None

    def set(self, key: str, value: Any, ttl_seconds: Optional[int] = 60):
        expires_at = time.time() + ttl_seconds if ttl_seconds else None
        self._store[key] = (value, expires_at)

    def invalidate(self, prefix: str):
        """Invalidates all keys matching the prefix."""
        keys_to_delete = [k for k in self._store if k.startswith(prefix)]
        for k in keys_to_delete:
            self._store.pop(k, None)

    def clear(self):
        self._store.clear()

cache = SimpleCache()
