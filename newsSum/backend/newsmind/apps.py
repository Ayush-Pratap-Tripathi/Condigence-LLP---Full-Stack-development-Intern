from django.apps import AppConfig

class NewsmindConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'newsmind'

    def ready(self):
        # import signals so they get registered
        import newsmind.signals  # noqa
