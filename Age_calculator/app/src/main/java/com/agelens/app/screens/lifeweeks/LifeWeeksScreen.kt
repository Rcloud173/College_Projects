package com.agelens.app.screens.lifeweeks

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.FilterChip
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.unit.dp
import com.agelens.app.calculator.LifeWeeksCalculator
import com.agelens.app.model.LifeWeeksSummary
import com.agelens.app.model.WeekInfo
import com.agelens.app.model.WeekStatus
import com.agelens.app.ui.components.DateOfBirthField
import java.time.LocalDate
import java.time.format.DateTimeFormatter
import kotlin.math.floor
import kotlin.math.min

/**
 * Life-in-Weeks: 1 square = 1 week, 1 row = 1 year.
 * Drawn with Canvas so large grids stay efficient.
 */
@Composable
fun LifeWeeksScreen() {
    var birthDate by remember { mutableStateOf<LocalDate?>(null) }
    var lifespanYears by remember { mutableIntStateOf(80) }
    var errorMessage by remember { mutableStateOf<String?>(null) }
    var summary by remember { mutableStateOf<LifeWeeksSummary?>(null) }
    var selectedWeek by remember { mutableStateOf<WeekInfo?>(null) }

    val pastColor = MaterialTheme.colorScheme.primary
    val currentColor = MaterialTheme.colorScheme.tertiary
    val futureColor = MaterialTheme.colorScheme.surfaceVariant
    val gridBackground = MaterialTheme.colorScheme.surface

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(24.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        Text(
            text = "Life in Weeks",
            style = MaterialTheme.typography.headlineMedium,
            color = MaterialTheme.colorScheme.primary
        )
        Text(
            text = "Each square is one week. Each row is one year.",
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )

        DateOfBirthField(
            label = "Date of birth",
            selectedDate = birthDate,
            onDateSelected = {
                birthDate = it
                errorMessage = null
                selectedWeek = null
            },
            isError = errorMessage != null,
            supportingText = errorMessage
        )

        Text(
            text = "Lifespan view",
            style = MaterialTheme.typography.titleSmall
        )
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            listOf(80, 90, 100).forEach { years ->
                FilterChip(
                    selected = lifespanYears == years,
                    onClick = {
                        lifespanYears = years
                        selectedWeek = null
                        // Refresh summary if already calculated
                        birthDate?.let { dob ->
                            if (!dob.isAfter(LocalDate.now())) {
                                summary = LifeWeeksCalculator.summarize(dob, years)
                            }
                        }
                    },
                    label = { Text("$years yrs") }
                )
            }
        }

        Button(
            onClick = {
                when {
                    birthDate == null -> {
                        errorMessage = "Please select a date of birth"
                        summary = null
                        selectedWeek = null
                    }
                    birthDate!!.isAfter(LocalDate.now()) -> {
                        errorMessage = "Date of birth cannot be in the future"
                        summary = null
                        selectedWeek = null
                    }
                    else -> {
                        errorMessage = null
                        selectedWeek = null
                        summary = LifeWeeksCalculator.summarize(
                            birthDate = birthDate!!,
                            lifespanYears = lifespanYears
                        )
                    }
                }
            },
            modifier = Modifier.fillMaxWidth()
        ) {
            Text("Show Life Grid")
        }

        summary?.let { data ->
            StatsRow(data)
            LegendRow(
                pastColor = pastColor,
                currentColor = currentColor,
                futureColor = futureColor
            )

            Text(
                text = "Tap a square for details",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )

            LifeWeeksGrid(
                summary = data,
                pastColor = pastColor,
                currentColor = currentColor,
                futureColor = futureColor,
                backgroundColor = gridBackground,
                onWeekTapped = { weekIndex ->
                    selectedWeek = LifeWeeksCalculator.weekInfo(
                        birthDate = data.birthDate,
                        weekIndex = weekIndex,
                        weeksLived = data.weeksLived
                    )
                }
            )

            selectedWeek?.let { week ->
                WeekDetailCard(week)
            }
        }
    }
}

@Composable
private fun StatsRow(data: LifeWeeksSummary) {
    Card(
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surfaceVariant
        )
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            Text(
                text = "Weeks lived: ${data.weeksLived}",
                style = MaterialTheme.typography.bodyLarge
            )
            Text(
                text = "Total weeks (${data.lifespanYears} yrs): ${data.totalWeeks}",
                style = MaterialTheme.typography.bodyLarge
            )
            Text(
                text = "Completed: ${"%.1f".format(data.percentCompleted)}%",
                style = MaterialTheme.typography.bodyLarge
            )
        }
    }
}

@Composable
private fun LegendRow(
    pastColor: Color,
    currentColor: Color,
    futureColor: Color
) {
    Row(
        horizontalArrangement = Arrangement.spacedBy(16.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        LegendItem(color = pastColor, label = "Past")
        LegendItem(color = currentColor, label = "Now")
        LegendItem(color = futureColor, label = "Future")
    }
}

@Composable
private fun LegendItem(color: Color, label: String) {
    Row(verticalAlignment = Alignment.CenterVertically) {
        Box(
            modifier = Modifier
                .size(12.dp)
                .background(color, RoundedCornerShape(2.dp))
        )
        Spacer(modifier = Modifier.width(6.dp))
        Text(text = label, style = MaterialTheme.typography.labelMedium)
    }
}

@Composable
private fun LifeWeeksGrid(
    summary: LifeWeeksSummary,
    pastColor: Color,
    currentColor: Color,
    futureColor: Color,
    backgroundColor: Color,
    onWeekTapped: (Int) -> Unit
) {
    val years = summary.lifespanYears
    val weeksLived = summary.weeksLived
    // Width:height = 52 : years  → aspectRatio = 52/years
    val ratio = LifeWeeksCalculator.WEEKS_PER_YEAR.toFloat() / years.toFloat()

    Canvas(
        modifier = Modifier
            .fillMaxWidth()
            .aspectRatio(ratio)
            .background(backgroundColor, RoundedCornerShape(8.dp))
            .pointerInput(summary) {
                detectTapGestures { offset ->
                    val cols = LifeWeeksCalculator.WEEKS_PER_YEAR
                    val cellW = size.width / cols
                    val cellH = size.height / years
                    val col = floor(offset.x / cellW).toInt()
                    val row = floor(offset.y / cellH).toInt()
                    if (row in 0 until years && col in 0 until cols) {
                        onWeekTapped(row * cols + col)
                    }
                }
            }
    ) {
        val cols = LifeWeeksCalculator.WEEKS_PER_YEAR
        val cellW = size.width / cols
        val cellH = size.height / years
        val gap = min(cellW, cellH) * 0.15f
        val corner = CornerRadius(gap, gap)

        for (year in 0 until years) {
            for (week in 0 until cols) {
                val index = year * cols + week
                val fill = when {
                    // Lived beyond the selected lifespan view → all past
                    weeksLived >= summary.totalWeeks -> pastColor
                    index < weeksLived -> pastColor
                    index == weeksLived -> currentColor
                    else -> futureColor
                }
                drawRoundRect(
                    color = fill,
                    topLeft = Offset(
                        x = week * cellW + gap / 2f,
                        y = year * cellH + gap / 2f
                    ),
                    size = Size(
                        width = (cellW - gap).coerceAtLeast(1f),
                        height = (cellH - gap).coerceAtLeast(1f)
                    ),
                    cornerRadius = corner
                )
            }
        }
    }
}

@Composable
private fun WeekDetailCard(week: WeekInfo) {
    val dateFormat = remember { DateTimeFormatter.ofPattern("dd MMM yyyy") }
    val statusLabel = when (week.status) {
        WeekStatus.PAST -> "Past week"
        WeekStatus.CURRENT -> "Current week"
        WeekStatus.FUTURE -> "Future week"
    }

    Card(
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.primaryContainer
        )
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(4.dp)
        ) {
            Text(
                text = statusLabel,
                style = MaterialTheme.typography.labelLarge,
                color = MaterialTheme.colorScheme.onPrimaryContainer
            )
            Text(
                text = "Approx. date: ${week.approximateDate.format(dateFormat)}",
                style = MaterialTheme.typography.bodyMedium
            )
            Text(
                text = "Age: ${week.ageYears}y ${week.ageMonths}m ${week.ageDays}d",
                style = MaterialTheme.typography.bodyMedium
            )
            Text(
                text = "Year ${week.yearIndex + 1}, week ${week.weekInYear + 1}",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}
