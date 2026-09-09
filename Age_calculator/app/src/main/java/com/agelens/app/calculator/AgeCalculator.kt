package com.agelens.app.calculator

import com.agelens.app.model.AgeDifferenceResult
import com.agelens.app.model.AgeResult
import com.agelens.app.model.HistoricalAgeResult
import java.time.DateTimeException
import java.time.LocalDate
import java.time.Period
import java.time.temporal.ChronoUnit

/**
 * Calendar-aware age math using java.time.
 * Uses Period.between for years/months/days — never days/365.
 */
object AgeCalculator {

    /**
     * Calculates current age details for [birthDate] relative to [today].
     * @throws IllegalArgumentException if the birth date is in the future
     */
    fun calculate(
        birthDate: LocalDate,
        name: String? = null,
        today: LocalDate = LocalDate.now()
    ): AgeResult {
        require(!birthDate.isAfter(today)) {
            "Date of birth cannot be in the future"
        }

        val period = Period.between(birthDate, today)
        val totalDays = ChronoUnit.DAYS.between(birthDate, today)
        val totalWeeks = totalDays / 7

        val nextBirthday = nextBirthday(birthDate, today)
        val daysUntil = ChronoUnit.DAYS.between(today, nextBirthday)
        val ageOnNext = Period.between(birthDate, nextBirthday).years

        return AgeResult(
            name = name?.trim()?.takeIf { it.isNotEmpty() },
            birthDate = birthDate,
            years = period.years,
            months = period.months,
            days = period.days,
            totalDaysLived = totalDays,
            totalWeeksLived = totalWeeks,
            nextBirthday = nextBirthday,
            daysUntilNextBirthday = daysUntil,
            ageOnNextBirthday = ageOnNext
        )
    }

    /**
     * Compares two birth dates and returns who is older plus the gap.
     */
    fun difference(
        firstBirthDate: LocalDate,
        secondBirthDate: LocalDate
    ): AgeDifferenceResult {
        if (firstBirthDate == secondBirthDate) {
            return AgeDifferenceResult(
                firstBirthDate = firstBirthDate,
                secondBirthDate = secondBirthDate,
                olderLabel = "Same age",
                areSameAge = true,
                years = 0,
                months = 0,
                days = 0,
                totalDays = 0
            )
        }

        val olderIsFirst = firstBirthDate.isBefore(secondBirthDate)
        val older = if (olderIsFirst) firstBirthDate else secondBirthDate
        val younger = if (olderIsFirst) secondBirthDate else firstBirthDate
        val period = Period.between(older, younger)
        val totalDays = ChronoUnit.DAYS.between(older, younger)

        val olderLabel = if (olderIsFirst) {
            "Person 1 is older"
        } else {
            "Person 2 is older"
        }

        return AgeDifferenceResult(
            firstBirthDate = firstBirthDate,
            secondBirthDate = secondBirthDate,
            olderLabel = olderLabel,
            areSameAge = false,
            years = period.years,
            months = period.months,
            days = period.days,
            totalDays = totalDays
        )
    }

    /**
     * Age on [targetDate] given [birthDate].
     * Allows past or future targets; rejects dates before birth.
     */
    fun historicalAge(
        birthDate: LocalDate,
        targetDate: LocalDate,
        today: LocalDate = LocalDate.now()
    ): HistoricalAgeResult {
        require(!targetDate.isBefore(birthDate)) {
            "Target date cannot be before date of birth"
        }

        val period = Period.between(birthDate, targetDate)
        val totalDays = ChronoUnit.DAYS.between(birthDate, targetDate)

        return HistoricalAgeResult(
            birthDate = birthDate,
            targetDate = targetDate,
            years = period.years,
            months = period.months,
            days = period.days,
            totalDays = totalDays,
            isFutureDate = targetDate.isAfter(today)
        )
    }

    /**
     * Next birthday on or after [today].
     * Feb 29 birthdays fall on Feb 28 in non-leap years.
     */
    fun nextBirthday(birthDate: LocalDate, today: LocalDate = LocalDate.now()): LocalDate {
        var candidate = birthdayInYear(birthDate, today.year)
        if (candidate.isBefore(today)) {
            candidate = birthdayInYear(birthDate, today.year + 1)
        }
        return candidate
    }

    /**
     * Anniversary of [birthDate] in [year].
     * Handles Feb 29 → Feb 28 when the year is not a leap year.
     */
    fun birthdayInYear(birthDate: LocalDate, year: Int): LocalDate {
        return try {
            birthDate.withYear(year)
        } catch (_: DateTimeException) {
            LocalDate.of(year, 2, 28)
        }
    }
}
