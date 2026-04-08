from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response


LOCATION_DATA = {
    "Maharashtra": {
        "Mumbai": {
            "wind": "44 m/sec",
            "seismic_zone": "Zone III",
            "zone_factor": "0.16",
            "min_temp": "22°C",
            "max_temp": "38°C",
        },
        "Pune": {
            "wind": "39 m/sec",
            "seismic_zone": "Zone III",
            "zone_factor": "0.16",
            "min_temp": "18°C",
            "max_temp": "36°C",
        },
    },
    "Karnataka": {
        "Bengaluru": {
            "wind": "33 m/sec",
            "seismic_zone": "Zone II",
            "zone_factor": "0.10",
            "min_temp": "19°C",
            "max_temp": "34°C",
        },
    },
    "Delhi": {
        "Central Delhi": {
            "wind": "47 m/sec",
            "seismic_zone": "Zone IV",
            "zone_factor": "0.24",
            "min_temp": "7°C",
            "max_temp": "43°C",
        },
    },
}


@api_view(["GET"])
def health_check(request):
    return Response({"message": "Backend is working"})


@api_view(["GET"])
def list_states(request):
    return Response({"states": list(LOCATION_DATA.keys())})


@api_view(["GET"])
def list_districts(request):
    state = request.query_params.get("state", "")

    if not state:
        return Response(
            {"detail": "Query parameter 'state' is required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    districts = LOCATION_DATA.get(state)
    if districts is None:
        return Response(
            {"detail": "State not found."},
            status=status.HTTP_404_NOT_FOUND,
        )

    return Response({"state": state, "districts": list(districts.keys())})


@api_view(["GET"])
def get_location_result(request):
    state = request.query_params.get("state", "")
    district = request.query_params.get("district", "")

    if not state or not district:
        return Response(
            {"detail": "Query parameters 'state' and 'district' are required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    state_data = LOCATION_DATA.get(state)
    if state_data is None:
        return Response(
            {"detail": "State not found."},
            status=status.HTTP_404_NOT_FOUND,
        )

    district_data = state_data.get(district)
    if district_data is None:
        return Response(
            {"detail": "District not found."},
            status=status.HTTP_404_NOT_FOUND,
        )

    return Response(
        {
            "state": state,
            "district": district,
            "result": district_data,
        }
    )


@api_view(["POST"])
def custom_loading_result(request):
    required_fields = [
        "wind",
        "seismic_zone",
        "zone_factor",
        "min_temp",
        "max_temp",
    ]
    payload = request.data

    missing_fields = [
        field for field in required_fields if str(payload.get(field, "")).strip() == ""
    ]
    if missing_fields:
        return Response(
            {
                "detail": "Missing required fields.",
                "missing_fields": missing_fields,
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    return Response(
        {
            "result": {
                "wind": payload["wind"],
                "seismic_zone": payload["seismic_zone"],
                "zone_factor": payload["zone_factor"],
                "min_temp": payload["min_temp"],
                "max_temp": payload["max_temp"],
            }
        }
    )
