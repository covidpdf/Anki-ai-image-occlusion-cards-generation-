"""Dependency injection container"""
from typing import Any, Dict, Type, TypeVar, Callable, Optional
from functools import wraps
import inspect

T = TypeVar('T')


class ServiceContainer:
    """Simple dependency injection container"""
    
    def __init__(self) -> None:
        self._services: Dict[str, Any] = {}
        self._factories: Dict[str, Callable[[], Any]] = {}
        self._singletons: Dict[str, Any] = {}
    
    def register_singleton(self, service_type: Type[T], instance: T) -> None:
        """Register a singleton instance"""
        key = self._get_key(service_type)
        self._singletons[key] = instance
    
    def register_factory(self, service_type: Type[T], factory: Callable[[], T]) -> None:
        """Register a factory function for a service"""
        key = self._get_key(service_type)
        self._factories[key] = factory
    
    def register_transient(self, service_type: Type[T], implementation: Type[T]) -> None:
        """Register a transient service (new instance each time)"""
        key = self._get_key(service_type)
        self._services[key] = implementation
    
    def get(self, service_type: Type[T]) -> T:
        """Get a service instance"""
        key = self._get_key(service_type)
        
        # Check singletons first
        if key in self._singletons:
            return self._singletons[key]
        
        # Check factories
        if key in self._factories:
            instance = self._factories[key]()
            self._singletons[key] = instance  # Cache factory result
            return instance
        
        # Check transient services
        if key in self._services:
            implementation = self._services[key]
            return self._create_instance(implementation)
        
        raise ValueError(f"Service {service_type} not registered")
    
    def _create_instance(self, cls: Type[T]) -> T:
        """Create instance with dependency injection"""
        sig = inspect.signature(cls.__init__)
        kwargs = {}
        
        for param_name, param in sig.parameters.items():
            if param_name == 'self':
                continue
            
            if param.annotation != inspect.Parameter.empty:
                try:
                    kwargs[param_name] = self.get(param.annotation)
                except ValueError:
                    if param.default == inspect.Parameter.empty:
                        raise
                    # Use default value if dependency not found
                    continue
        
        return cls(**kwargs)
    
    def _get_key(self, service_type: Type) -> str:
        """Get registration key for service type"""
        return f"{service_type.__module__}.{service_type.__qualname__}"


# Global container instance
_container: Optional[ServiceContainer] = None


def get_service_container() -> ServiceContainer:
    """Get the global service container"""
    global _container
    if _container is None:
        _container = ServiceContainer()
    return _container


def inject(service_type: Type[T]) -> Callable[..., Callable[..., T]]:
    """Decorator for dependency injection"""
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        def wrapper(*args, **kwargs):
            container = get_service_container()
            service = container.get(service_type)
            
            # Inject service as keyword argument if not already provided
            if service_type.__name__.lower() not in kwargs:
                kwargs[service_type.__name__.lower()] = service
            
            return func(*args, **kwargs)
        return wrapper
    return decorator