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

MATERIAL_OPTIONS = {
    "girder": ["E250", "E350", "E450"],
    "cross_bracing": ["E250", "E350", "E450"],
    "deck": ["M25", "M30", "M35", "M40", "M45", "M50", "M55", "M60"],
}

BASIC_INPUT_OPTIONS = {
    "structure_types": ["Highway", "Other"],
    "footpath_options": ["Single-sided", "Both", "None"],
    "material_options": MATERIAL_OPTIONS,
}


def _to_float(value):
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def _to_int(value):
    try:
        return int(value)
    except (TypeError, ValueError):
        return None


@api_view(["GET"])
def health_check(request):
    return Response({"message": "Backend is working"})


@api_view(["GET"])
def basic_input_options(request):
    return Response(BASIC_INPUT_OPTIONS)


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


@api_view(["POST"])
def validate_geometry_inputs(request):
    payload = request.data

    span = _to_float(payload.get("span"))
    carriageway_width = _to_float(payload.get("carriageway_width"))
    skew_angle = _to_float(payload.get("skew_angle"))
    footpath = payload.get("footpath", "")

    errors = {}

    if span is not None and (span < 20 or span > 45):
        errors["span"] = "Outside the software range."

    if carriageway_width is not None and (
        carriageway_width < 4.25 or carriageway_width >= 24
    ):
        errors["carriageway_width"] = (
            "Width must be at least 4.25 m and less than 24 m."
        )

    if skew_angle is not None and (skew_angle < -15 or skew_angle > 15):
        errors["skew_angle"] = "IRC 24 (2010) requires detailed analysis."

    if footpath and footpath not in BASIC_INPUT_OPTIONS["footpath_options"]:
        errors["footpath"] = "Invalid footpath option."

    return Response({"valid": not errors, "errors": errors})


@api_view(["POST"])
def calculate_additional_geometry(request):
    payload = request.data

    carriageway_width = _to_float(payload.get("carriageway_width"))
    girder_spacing = _to_float(payload.get("girder_spacing"))
    number_of_girders = _to_int(payload.get("number_of_girders"))
    deck_overhang_width = _to_float(payload.get("deck_overhang_width"))
    driver = payload.get("driver", "")

    if carriageway_width is None:
        return Response(
            {"detail": "Field 'carriageway_width' is required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    overall_bridge_width = carriageway_width + 5
    errors = {}

    if girder_spacing is not None and girder_spacing >= overall_bridge_width:
        errors["girder_spacing"] = (
            "Girder spacing must be less than overall bridge width."
        )

    if (
        deck_overhang_width is not None
        and deck_overhang_width >= overall_bridge_width
    ):
        errors["deck_overhang_width"] = (
            "Deck overhang width must be less than overall bridge width."
        )

    if (
        driver == ""
        and girder_spacing is not None
        and deck_overhang_width is not None
        and number_of_girders is not None
        and girder_spacing > 0
    ):
        expected_girders = (
            overall_bridge_width - deck_overhang_width
        ) / girder_spacing
        if int(expected_girders) != expected_girders or expected_girders != number_of_girders:
            errors["formula"] = (
                "Inputs must satisfy (Overall Width - Overhang) / "
                "Spacing = No. of Girders."
            )

    if errors:
        return Response(
            {
                "valid": False,
                "overall_bridge_width": round(overall_bridge_width, 2),
                "errors": errors,
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    result = {
        "overall_bridge_width": round(overall_bridge_width, 2),
        "girder_spacing": girder_spacing,
        "number_of_girders": number_of_girders,
        "deck_overhang_width": deck_overhang_width,
    }

    if (
        driver == "spacing"
        and girder_spacing is not None
        and deck_overhang_width is not None
        and girder_spacing > 0
    ):
        calculated_girders = (
            overall_bridge_width - deck_overhang_width
        ) / girder_spacing
        if int(calculated_girders) == calculated_girders and calculated_girders > 0:
            result["number_of_girders"] = int(calculated_girders)
        else:
            result["number_of_girders"] = ""

    elif (
        driver == "girders"
        and number_of_girders is not None
        and deck_overhang_width is not None
        and number_of_girders > 0
    ):
        result["girder_spacing"] = round(
            (overall_bridge_width - deck_overhang_width) / number_of_girders, 1
        )

    elif driver == "overhang":
        if (
            girder_spacing is not None
            and girder_spacing > 0
            and deck_overhang_width is not None
        ):
            calculated_girders = (
                overall_bridge_width - deck_overhang_width
            ) / girder_spacing
            if int(calculated_girders) == calculated_girders and calculated_girders > 0:
                result["number_of_girders"] = int(calculated_girders)
            else:
                result["number_of_girders"] = ""
        elif (
            number_of_girders is not None
            and number_of_girders > 0
            and deck_overhang_width is not None
        ):
            result["girder_spacing"] = round(
                (overall_bridge_width - deck_overhang_width) / number_of_girders, 1
            )

    elif girder_spacing is not None and deck_overhang_width is not None and girder_spacing > 0:
        calculated_girders = (
            overall_bridge_width - deck_overhang_width
        ) / girder_spacing
        if int(calculated_girders) == calculated_girders and calculated_girders > 0:
            result["number_of_girders"] = int(calculated_girders)

    elif number_of_girders is not None and deck_overhang_width is not None and number_of_girders > 0:
        result["girder_spacing"] = round(
            (overall_bridge_width - deck_overhang_width) / number_of_girders, 1
        )

    elif girder_spacing is not None and number_of_girders is not None and girder_spacing > 0:
        result["deck_overhang_width"] = round(
            overall_bridge_width - (girder_spacing * number_of_girders), 1
        )

    return Response({"valid": True, "result": result})
