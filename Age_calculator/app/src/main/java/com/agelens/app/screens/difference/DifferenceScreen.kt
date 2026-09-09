package com.agelens.app.screens.difference

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
import com.agelens.app.model.AgeDifferenceResult
import com.agelens.app.ui.components.DateOfBirthField
import java.time.LocalDate

/**
 * Compare two dates of birth and show who is older plus the gap.
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DifferenceScreen(onBack: () -> Unit) {
    var firstDob by remember { mutableStateOf<LocalDate?>(null) }
    var secondDob by remember { mutableStateOf<LocalDate?>(null) }
    var errorMessage by remember { mutableStateOf<String?>(null) }
    var result by remember { mutableStateOf<AgeDifferenceResult?>(null) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Age Difference") },
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
                text = "Enter two dates of birth to compare ages.",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )

            DateOfBirthField(
                label = "Person 1 date of birth",
                selectedDate = firstDob,
                onDateSelected = {
                    firstDob = it
                    errorMessage = null
                }
            )

            DateOfBirthField(
                label = "Person 2 date of birth",
                selectedDate = secondDob,
                onDateSelected = {
                    secondDob = it
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
                        firstDob == null || secondDob == null -> {
                            errorMessage = "Please select both dates of birth"
                            result = null
                        }
                        else -> {
                            errorMessage = null
                            result = AgeCalculator.difference(firstDob!!, secondDob!!)
                        }
                    }
                },
                modifier = Modifier.fillMaxWidth()
            ) {
                Text("Compare Ages")
            }

            result?.let { diff ->
                DifferenceResultCard(diff)
            }
        }
    }
}

@Composable
private fun DifferenceResultCard(diff: AgeDifferenceResult) {
    Card(
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surfaceVariant
        )
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(
                text = diff.olderLabel,
                style = MaterialTheme.typography.titleMedium,
                color = MaterialTheme.colorScheme.primary
            )
            Spacer(modifier = Modifier.height(8.dp))

            if (diff.areSameAge) {
                Text(
                    text = "Both people have the same date of birth.",
                    style = MaterialTheme.typography.bodyMedium
                )
                Text(
                    text = "Difference: 0 years, 0 months, 0 days",
                    style = MaterialTheme.typography.bodyMedium
                )
                Text(
                    text = "Total days apart: 0",
                    style = MaterialTheme.typography.bodyMedium
                )
            } else {
                Text(
                    text = "Difference: ${diff.years} years, ${diff.months} months, ${diff.days} days",
                    style = MaterialTheme.typography.bodyLarge
                )
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = "Total days apart: ${diff.totalDays}",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }
    }
}
