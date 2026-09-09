package com.agelens.app.model

import java.time.LocalDate

/**
 * Result of an age calculation from a date of birth.
 * Easy to explain: one data class holding everything the Home screen shows.
 */
data class AgeResult(
    val name: String?,
    val birthDate: LocalDate,
    val years: Int,
    val months: Int,
    val days: Int,
    val totalDaysLived: Long,
    val totalWeeksLived: Long,
    val nextBirthday: LocalDate,
    val daysUntilNextBirthday: Long,
    val ageOnNextBirthday: Int
)
