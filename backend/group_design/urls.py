from django.urls import path

from .views import (
    basic_input_options,
    calculate_additional_geometry,
    custom_loading_result,
    get_location_result,
    health_check,
    list_districts,
    list_states,
    validate_geometry_inputs,
)

urlpatterns = [
    path("health/", health_check, name="health_check"),
    path("basic-inputs/options/", basic_input_options, name="basic_input_options"),
    path("locations/states/", list_states, name="list_states"),
    path("locations/districts/", list_districts, name="list_districts"),
    path("locations/result/", get_location_result, name="get_location_result"),
    path(
        "locations/custom-loading/",
        custom_loading_result,
        name="custom_loading_result",
    ),
    path("geometry/validate/", validate_geometry_inputs, name="validate_geometry_inputs"),
    path(
        "geometry/additional/",
        calculate_additional_geometry,
        name="calculate_additional_geometry",
    ),
]
