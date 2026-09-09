package com.agelens.app.model

import com.google.gson.annotations.SerializedName

/**
 * Body sent to POST /api/calculations
 */
data class CalculationRequest(
    val name: String?,
    val birthDate: String,
    val calculationType: String,
    val result: Map<String, Any?>
)

/**
 * Document returned by the AgeLens API.
 * MongoDB uses _id; Gson maps it to [id].
 */
data class CalculationDto(
    @SerializedName("_id")
    val id: String,
    val name: String?,
    val birthDate: String,
    val calculationType: String,
    val result: Map<String, Any?>?,
    val createdAt: String?
)
