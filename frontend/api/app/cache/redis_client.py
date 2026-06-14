import redis
import os
import json
import logging
from typing import Any, Optional

REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT = int(os.getenv("REDIS_PORT", 6379))
REDIS_DB = int(os.getenv("REDIS_DB", 0))

class RedisCache:
    def __init__(self):
        self.client = None
        try:
            self.client = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, db=REDIS_DB, decode_responses=True)
            self.client.ping() # Test connection
        except Exception as e:
            logging.warning(f"Redis not available: {e}. Falling back to in-memory dictionary cache.")
            self.client = None
            self._fallback_cache = {}

    def set(self, key: str, value: Any, expire_seconds: int = 3600) -> bool:
        try:
            if self.client:
                self.client.setex(key, expire_seconds, json.dumps(value))
                return True
            else:
                self._fallback_cache[key] = value
                return True
        except Exception as e:
            logging.error(f"Redis set error: {e}")
            return False

    def get(self, key: str) -> Optional[Any]:
        try:
            if self.client:
                val = self.client.get(key)
                return json.loads(val) if val else None
            else:
                return self._fallback_cache.get(key)
        except Exception as e:
            logging.error(f"Redis get error: {e}")
            return None

redis_cache = RedisCache()
