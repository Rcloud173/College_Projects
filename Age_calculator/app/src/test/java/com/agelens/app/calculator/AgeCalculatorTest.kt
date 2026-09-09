package com.agelens.app.calculator

import org.junit.Assert.assertEquals
import org.junit.Assert.assertThrows
import org.junit.Assert.assertTrue
import org.junit.Test
import java.time.LocalDate

/**
 * Unit tests for calendar-aware age math (easy to demo in a viva).
 */
class AgeCalculatorTest {

    @Test
    fun calculate_exactBirthday_returnsExpectedAge() {
        val result = AgeCalculator.calculate(
            birthDate = LocalDate.of(2000, 5, 10),
            today = LocalDate.of(2026, 5, 10)
        )
        assertEquals(26, result.years)
        assertEquals(0, result.months)
        assertEquals(0, result.days)
        assertEquals(0, result.daysUntilNextBirthday)
        assertEquals(26, result.ageOnNextBirthday)
    }

    @Test
    fun calculate_rejectsFutureDob() {
        assertThrows(IllegalArgumentException::class.java) {
            AgeCalculator.calculate(
                birthDate = LocalDate.of(2030, 1, 1),
                today = LocalDate.of(2026, 9, 4)
            )
        }
    }

    @Test
    fun birthdayInYear_feb29_nonLeap_becomesFeb28() {
        val dob = LocalDate.of(2000, 2, 29)
        assertEquals(LocalDate.of(2025, 2, 28), AgeCalculator.birthdayInYear(dob, 2025))
        assertEquals(LocalDate.of(2024, 2, 29), AgeCalculator.birthdayInYear(dob, 2024))
    }

    @Test
    fun difference_identicalDobs_sameAge() {
        val dob = LocalDate.of(1999, 3, 15)
        val result = AgeCalculator.difference(dob, dob)
        assertTrue(result.areSameAge)
        assertEquals(0, result.years)
        assertEquals(0, result.totalDays)
    }

    @Test
    fun difference_person1Older() {
        val result = AgeCalculator.difference(
            firstBirthDate = LocalDate.of(1990, 1, 1),
            secondBirthDate = LocalDate.of(2000, 1, 1)
        )
        assertEquals("Person 1 is older", result.olderLabel)
        assertEquals(10, result.years)
    }

    @Test
    fun historicalAge_rejectsBeforeDob() {
        assertThrows(IllegalArgumentException::class.java) {
            AgeCalculator.historicalAge(
                birthDate = LocalDate.of(2000, 6, 1),
                targetDate = LocalDate.of(1999, 1, 1)
            )
        }
    }

    @Test
    fun historicalAge_knownPeriod() {
        val result = AgeCalculator.historicalAge(
            birthDate = LocalDate.of(2000, 1, 1),
            targetDate = LocalDate.of(2010, 1, 1),
            today = LocalDate.of(2026, 1, 1)
        )
        assertEquals(10, result.years)
        assertEquals(0, result.months)
        assertEquals(0, result.days)
        assertEquals(3653, result.totalDays) // 10*365 + leap days 2000, 2004, 2008
    }
}
