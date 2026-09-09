package com.agelens.app.data

import com.agelens.app.model.CalculationDto
import com.agelens.app.model.CalculationRequest
import retrofit2.http.Body
import retrofit2.http.DELETE
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Path

/**
 * Retrofit interface for the AgeLens Express API.
 * Base URL points at the backend — never at MongoDB.
 */
interface ApiService {

    @POST("api/calculations")
    suspend fun saveCalculation(@Body body: CalculationRequest): CalculationDto

    @GET("api/calculations")
    suspend fun getCalculations(): List<CalculationDto>

    @DELETE("api/calculations/{id}")
    suspend fun deleteCalculation(@Path("id") id: String): Map<String, Any>
}
