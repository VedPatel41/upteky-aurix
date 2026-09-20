"""
URL configuration for aurix_backend project.
AURIX — AI Business Process Intelligence & Automation Orchestration Platform
"""

from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("api.urls")),
]
