package com.agelens.app.model

import java.time.LocalDate

/**
 * Result of comparing two dates of birth.
 */
data class AgeDifferenceResult(
    val firstBirthDate: LocalDate,
    val secondBirthDate: LocalDate,
    val olderLabel: String,
    val areSameAge: Boolean,
    val years: Int,
    val months: Int,
    val days: Int,
    val totalDays: Long
)

/**
 * Age on a chosen past or future date.
 */
data class HistoricalAgeResult(
    val birthDate: LocalDate,
    val targetDate: LocalDate,
    val years: Int,
    val months: Int,
    val days: Int,
    val totalDays: Long,
    val isFutureDate: Boolean
)
