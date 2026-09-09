package com.agelens.app.calculator

import com.agelens.app.model.LifeWeeksSummary
import com.agelens.app.model.WeekInfo
import com.agelens.app.model.WeekStatus
import java.time.LocalDate
import java.time.Period
import java.time.temporal.ChronoUnit

/**
 * Life-in-Weeks math: 1 square = 1 week, 1 row = 1 year (52 weeks).
 * Keeps UI free of date logic.
 */
object LifeWeeksCalculator {

    const val WEEKS_PER_YEAR = 52

    fun summarize(
        birthDate: LocalDate,
        lifespanYears: Int,
        today: LocalDate = LocalDate.now()
    ): LifeWeeksSummary {
        require(!birthDate.isAfter(today)) {
            "Date of birth cannot be in the future"
        }
        require(lifespanYears in listOf(80, 90, 100)) {
            "Lifespan view must be 80, 90, or 100"
        }

        val totalWeeks = lifespanYears * WEEKS_PER_YEAR
        val weeksLived = ChronoUnit.WEEKS.between(birthDate, today)
            .toInt()
            .coerceAtLeast(0)

        val currentWeekIndex = weeksLived.coerceAtMost(totalWeeks - 1)
        val percent = (weeksLived.toDouble() / totalWeeks.toDouble()) * 100.0

        return LifeWeeksSummary(
            birthDate = birthDate,
            lifespanYears = lifespanYears,
            weeksLived = weeksLived,
            totalWeeks = totalWeeks,
            percentCompleted = percent.coerceAtMost(100.0),
            currentWeekIndex = currentWeekIndex
        )
    }

    fun weekInfo(
        birthDate: LocalDate,
        weekIndex: Int,
        weeksLived: Int,
        today: LocalDate = LocalDate.now()
    ): WeekInfo {
        val approximateDate = birthDate.plusWeeks(weekIndex.toLong())
        val age = Period.between(birthDate, approximateDate)
        val status = when {
            weekIndex < weeksLived -> WeekStatus.PAST
            weekIndex == weeksLived -> WeekStatus.CURRENT
            else -> WeekStatus.FUTURE
        }

        return WeekInfo(
            weekIndex = weekIndex,
            yearIndex = weekIndex / WEEKS_PER_YEAR,
            weekInYear = weekIndex % WEEKS_PER_YEAR,
            approximateDate = approximateDate,
            ageYears = age.years,
            ageMonths = age.months,
            ageDays = age.days,
            status = status
        )
    }
}
