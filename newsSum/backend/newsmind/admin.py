from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser


class CustomUserAdmin(UserAdmin):
    model = CustomUser
    list_display = ("username", "email", "is_staff", "avatar")
    fieldsets = UserAdmin.fieldsets + (
        (None, {"fields": ("mongo_collection_name", "avatar")}),
    )


admin.site.register(CustomUser, CustomUserAdmin)
