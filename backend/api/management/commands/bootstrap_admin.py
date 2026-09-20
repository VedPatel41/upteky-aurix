import os
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User


class Command(BaseCommand):
    help = "Safely bootstrap or update a Django superuser for local/demo environment"

    def add_arguments(self, parser):
        parser.add_argument("--username", type=str, default=None, help="Superuser username")
        parser.add_argument("--password", type=str, default=None, help="Superuser password")
        parser.add_argument("--email", type=str, default=None, help="Superuser email")

    def handle(self, *args, **options):
        username = options["username"] or os.environ.get("DJANGO_SUPERUSER_USERNAME", "admin")
        password = options["password"] or os.environ.get("DJANGO_SUPERUSER_PASSWORD", "password123")
        email = options["email"] or os.environ.get("DJANGO_SUPERUSER_EMAIL", "admin@aurix.ai")

        user, created = User.objects.get_or_create(username=username, defaults={"email": email})
        user.is_staff = True
        user.is_superuser = True
        user.is_active = True
        user.email = email
        user.set_password(password)
        user.save()

        if created:
            self.stdout.write(self.style.SUCCESS(f"Successfully created superuser '{username}'."))
        else:
            self.stdout.write(self.style.SUCCESS(f"Successfully updated credentials for existing superuser '{username}'."))
