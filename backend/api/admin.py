from django.contrib import admin
from .models import CustomUser, Employee, Attendence, FaceData

class UserAdmin(admin.ModelAdmin):
    list_display = ('username', 'email', 'password', 'is_verified')

class EmployeeAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'emp_code', 'name', 'mobile', 'dob', 'designation', 'department', 'date_joined', 'is_active', 'created_at', 'update_at')

class AttendenceAdmin(admin.ModelAdmin):
    list_display = ('id', 'employee', 'start_time', 'end_time', 'total_work_time', 'total_idle_time', 'status', 'created_at')

class FaceDataAdmin(admin.ModelAdmin):
    list_display = ('id', 'employee', 'embedding', 'is_active', 'created_at')

admin.site.register(CustomUser, UserAdmin)
admin.site.register(Employee, EmployeeAdmin)
admin.site.register(Attendence, AttendenceAdmin)
admin.site.register(FaceData, FaceDataAdmin)
