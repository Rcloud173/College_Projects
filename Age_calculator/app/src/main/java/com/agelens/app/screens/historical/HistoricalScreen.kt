package com.agelens.app.screens.historical

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.agelens.app.calculator.AgeCalculator
import com.agelens.app.model.HistoricalAgeResult
import com.agelens.app.ui.components.DateOfBirthField
import java.time.LocalDate
import java.time.format.DateTimeFormatter

/**
 * Find age on any past or future date.
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HistoricalScreen(onBack: () -> Unit) {
    var birthDate by remember { mutableStateOf<LocalDate?>(null) }
    var targetDate by remember { mutableStateOf<LocalDate?>(null) }
    var errorMessage by remember { mutableStateOf<String?>(null) }
    var result by remember { mutableStateOf<HistoricalAgeResult?>(null) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Historical Age") },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                            contentDescription = "Back"
                        )
                    }
                }
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .verticalScroll(rememberScrollState())
                .padding(24.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            Text(
                text = "Pick a birth date and any past or future date.",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )

            DateOfBirthField(
                label = "Date of birth",
                selectedDate = birthDate,
                onDateSelected = {
                    birthDate = it
                    errorMessage = null
                }
            )

            DateOfBirthField(
                label = "Target date",
                selectedDate = targetDate,
                onDateSelected = {
                    targetDate = it
                    errorMessage = null
                }
            )

            if (errorMessage != null) {
                Text(
                    text = errorMessage!!,
                    color = MaterialTheme.colorScheme.error,
                    style = MaterialTheme.typography.bodySmall
                )
            }

            Button(
                onClick = {
                    when {
                        birthDate == null || targetDate == null -> {
                            errorMessage = "Please select both dates"
                            result = null
                        }
                        targetDate!!.isBefore(birthDate!!) -> {
                            errorMessage = "Target date cannot be before date of birth"
                            result = null
                        }
                        else -> {
                            errorMessage = null
                            result = AgeCalculator.historicalAge(
                                birthDate = birthDate!!,
                                targetDate = targetDate!!
                            )
                        }
                    }
                },
                modifier = Modifier.fillMaxWidth()
            ) {
                Text("Calculate Historical Age")
            }

            result?.let { historical ->
                HistoricalResultCard(historical)
            }
        }
    }
}

@Composable
private fun HistoricalResultCard(result: HistoricalAgeResult) {
    val dateFormat = remember { DateTimeFormatter.ofPattern("dd MMM yyyy") }
    val sentence = when {
        result.isFutureDate ->
            "You will be ${result.years} years, ${result.months} months, ${result.days} days old."
        result.targetDate == LocalDate.now() ->
            "You are ${result.years} years, ${result.months} months, ${result.days} days old."
        else ->
            "You were ${result.years} years, ${result.months} months, ${result.days} days old."
    }

    Card(
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surfaceVariant
        )
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(
                text = "On ${result.targetDate.format(dateFormat)}",
                style = MaterialTheme.typography.labelLarge,
                color = MaterialTheme.colorScheme.primary
            )
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = sentence,
                style = MaterialTheme.typography.titleMedium
            )
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = "Total days: ${result.totalDays}",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}
