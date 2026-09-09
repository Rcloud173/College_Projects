package com.agelens.app.model

import java.time.LocalDate

enum class WeekStatus {
    PAST,
    CURRENT,
    FUTURE
}

/**
 * Summary stats for the Life-in-Weeks grid.
 */
data class LifeWeeksSummary(
    val birthDate: LocalDate,
    val lifespanYears: Int,
    val weeksLived: Int,
    val totalWeeks: Int,
    val percentCompleted: Double,
    val currentWeekIndex: Int
)

/**
 * Details shown when the user taps one week square.
 */
data class WeekInfo(
    val weekIndex: Int,
    val yearIndex: Int,
    val weekInYear: Int,
    val approximateDate: LocalDate,
    val ageYears: Int,
    val ageMonths: Int,
    val ageDays: Int,
    val status: WeekStatus
)
