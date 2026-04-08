from django.urls import path

from .views import (
    custom_loading_result,
    get_location_result,
    health_check,
    list_districts,
    list_states,
)

urlpatterns = [
    path("health/", health_check, name="health_check"),
    path("locations/states/", list_states, name="list_states"),
    path("locations/districts/", list_districts, name="list_districts"),
    path("locations/result/", get_location_result, name="get_location_result"),
    path(
        "locations/custom-loading/",
        custom_loading_result,
        name="custom_loading_result",
    ),
]
