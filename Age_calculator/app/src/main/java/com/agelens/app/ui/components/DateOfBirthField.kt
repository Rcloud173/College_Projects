package com.agelens.app.ui.components

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.DateRange
import androidx.compose.material3.DatePicker
import androidx.compose.material3.DatePickerDialog
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.rememberDatePickerState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import java.time.Instant
import java.time.LocalDate
import java.time.ZoneOffset
import java.time.format.DateTimeFormatter

private val displayFormatter: DateTimeFormatter = DateTimeFormatter.ofPattern("dd MMM yyyy")

/**
 * Read-only date field with a calendar button that opens Material 3 date picker.
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DateOfBirthField(
    label: String,
    selectedDate: LocalDate?,
    onDateSelected: (LocalDate) -> Unit,
    modifier: Modifier = Modifier,
    isError: Boolean = false,
    supportingText: String? = null
) {
    var showPicker by remember { mutableStateOf(false) }

    OutlinedTextField(
        value = selectedDate?.format(displayFormatter) ?: "",
        onValueChange = {},
        readOnly = true,
        label = { Text(label) },
        placeholder = { Text("Tap the calendar icon") },
        isError = isError,
        supportingText = supportingText?.let { { Text(it) } },
        trailingIcon = {
            IconButton(onClick = { showPicker = true }) {
                Icon(
                    imageVector = Icons.Filled.DateRange,
                    contentDescription = "Pick date"
                )
            }
        },
        modifier = modifier.fillMaxWidth()
    )

    if (showPicker) {
        val initialMillis = selectedDate
            ?.atStartOfDay(ZoneOffset.UTC)
            ?.toInstant()
            ?.toEpochMilli()

        val state = rememberDatePickerState(
            initialSelectedDateMillis = initialMillis,
            yearRange = 1900..2100
        )

        DatePickerDialog(
            onDismissRequest = { showPicker = false },
            confirmButton = {
                TextButton(
                    onClick = {
                        state.selectedDateMillis?.let { millis ->
                            val date = Instant.ofEpochMilli(millis)
                                .atZone(ZoneOffset.UTC)
                                .toLocalDate()
                            onDateSelected(date)
                        }
                        showPicker = false
                    }
                ) {
                    Text("OK")
                }
            },
            dismissButton = {
                TextButton(onClick = { showPicker = false }) {
                    Text("Cancel")
                }
            }
        ) {
            DatePicker(state = state)
        }
    }
}
