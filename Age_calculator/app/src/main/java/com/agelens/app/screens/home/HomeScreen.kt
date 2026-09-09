package com.agelens.app.screens.home

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.agelens.app.calculator.AgeCalculator
import com.agelens.app.data.ApiClient
import com.agelens.app.model.AgeResult
import com.agelens.app.model.CalculationRequest
import com.agelens.app.ui.components.DateOfBirthField
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.time.LocalDate
import java.time.format.DateTimeFormatter

/**
 * Home / Age Calculator screen.
 * Name (optional) + DOB → age details, with optional save to History API.
 */
@Composable
fun HomeScreen() {
    var name by remember { mutableStateOf("") }
    var birthDate by remember { mutableStateOf<LocalDate?>(null) }
    var errorMessage by remember { mutableStateOf<String?>(null) }
    var result by remember { mutableStateOf<AgeResult?>(null) }
    var saveMessage by remember { mutableStateOf<String?>(null) }
    var isSaving by remember { mutableStateOf(false) }
    val scope = rememberCoroutineScope()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(24.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        Text(
            text = "AgeLens",
            style = MaterialTheme.typography.headlineMedium,
            color = MaterialTheme.colorScheme.primary
        )
        Text(
            text = "Age Calculator",
            style = MaterialTheme.typography.titleLarge
        )
        Text(
            text = "Enter a date of birth to see your exact age and next birthday.",
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )

        OutlinedTextField(
            value = name,
            onValueChange = { name = it },
            label = { Text("Name (optional)") },
            singleLine = true,
            modifier = Modifier.fillMaxWidth()
        )

        DateOfBirthField(
            label = "Date of birth",
            selectedDate = birthDate,
            onDateSelected = {
                birthDate = it
                errorMessage = null
            },
            isError = errorMessage != null,
            supportingText = errorMessage
        )

        Button(
            onClick = {
                saveMessage = null
                when {
                    birthDate == null -> {
                        errorMessage = "Please select a date of birth"
                        result = null
                    }
                    birthDate!!.isAfter(LocalDate.now()) -> {
                        errorMessage = "Date of birth cannot be in the future"
                        result = null
                    }
                    else -> {
                        errorMessage = null
                        result = try {
                            AgeCalculator.calculate(
                                birthDate = birthDate!!,
                                name = name
                            )
                        } catch (e: IllegalArgumentException) {
                            errorMessage = e.message ?: "Invalid date"
                            null
                        }
                    }
                }
            },
            modifier = Modifier.fillMaxWidth()
        ) {
            Text("Calculate Age")
        }

        result?.let { age ->
            AgeResultSection(age)

            OutlinedButton(
                onClick = {
                    if (isSaving) return@OutlinedButton
                    isSaving = true
                    saveMessage = null
                    scope.launch {
                        val message = withContext(Dispatchers.IO) {
                            try {
                                ApiClient.api.saveCalculation(
                                    CalculationRequest(
                                        name = age.name,
                                        birthDate = age.birthDate.toString(),
                                        calculationType = "age",
                                        result = age.toResultMap()
                                    )
                                )
                                "Saved to History"
                            } catch (e: Exception) {
                                "Could not save: check that the backend is running"
                            }
                        }
                        saveMessage = message
                        isSaving = false
                    }
                },
                enabled = !isSaving,
                modifier = Modifier.fillMaxWidth()
            ) {
                Text(if (isSaving) "Saving…" else "Save to History")
            }

            saveMessage?.let { msg ->
                Text(
                    text = msg,
                    style = MaterialTheme.typography.bodySmall,
                    color = if (msg.startsWith("Saved")) {
                        MaterialTheme.colorScheme.tertiary
                    } else {
                        MaterialTheme.colorScheme.error
                    }
                )
            }
        }
    }
}

private fun AgeResult.toResultMap(): Map<String, Any?> = mapOf(
    "years" to years,
    "months" to months,
    "days" to days,
    "totalDaysLived" to totalDaysLived,
    "totalWeeksLived" to totalWeeksLived,
    "nextBirthday" to nextBirthday.toString(),
    "daysUntilNextBirthday" to daysUntilNextBirthday,
    "ageOnNextBirthday" to ageOnNextBirthday
)

@Composable
private fun AgeResultSection(age: AgeResult) {
    val dateFormat = remember { DateTimeFormatter.ofPattern("dd MMM yyyy") }

    Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
        age.name?.let { displayName ->
            Text(
                text = "Results for $displayName",
                style = MaterialTheme.typography.titleMedium
            )
        }

        ResultCard(title = "Current age") {
            Text(
                text = "${age.years} years, ${age.months} months, ${age.days} days",
                style = MaterialTheme.typography.titleMedium
            )
        }

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            ResultCard(
                title = "Days lived",
                modifier = Modifier.weight(1f)
            ) {
                Text(
                    text = "${age.totalDaysLived}",
                    style = MaterialTheme.typography.titleMedium
                )
            }
            ResultCard(
                title = "Weeks lived",
                modifier = Modifier.weight(1f)
            ) {
                Text(
                    text = "${age.totalWeeksLived}",
                    style = MaterialTheme.typography.titleMedium
                )
            }
        }

        ResultCard(title = "Next birthday") {
            Text(
                text = age.nextBirthday.format(dateFormat),
                style = MaterialTheme.typography.titleMedium
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = "${age.daysUntilNextBirthday} days to go",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            Text(
                text = "Turning ${age.ageOnNextBirthday}",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}

@Composable
private fun ResultCard(
    title: String,
    modifier: Modifier = Modifier,
    content: @Composable () -> Unit
) {
    Card(
        modifier = modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surfaceVariant
        )
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(
                text = title,
                style = MaterialTheme.typography.labelLarge,
                color = MaterialTheme.colorScheme.primary
            )
            Spacer(modifier = Modifier.height(6.dp))
            content()
        }
    }
}
