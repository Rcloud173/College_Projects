package com.agelens.app.data

import okhttp3.OkHttpClient
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit

/**
 * Single Retrofit instance for the app.
 *
 * Emulator → host machine: 10.0.2.2
 * Physical device: replace with your PC's LAN IP, e.g. http://192.168.1.10:5000/
 */
object ApiClient {

    // 10.0.2.2 is the Android emulator alias for the host computer's localhost
    private const val BASE_URL = "http://10.0.2.2:5000/"

    private val httpClient: OkHttpClient by lazy {
        OkHttpClient.Builder()
            .connectTimeout(10, TimeUnit.SECONDS)
            .readTimeout(15, TimeUnit.SECONDS)
            .writeTimeout(15, TimeUnit.SECONDS)
            .build()
    }

    val api: ApiService by lazy {
        Retrofit.Builder()
            .baseUrl(BASE_URL)
            .client(httpClient)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(ApiService::class.java)
    }
}
