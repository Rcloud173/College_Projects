package com.agelens.app.screens.history

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.agelens.app.data.ApiClient
import com.agelens.app.model.CalculationDto
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

/**
 * History screen: list and delete calculations from the Express API.
 */
@Composable
fun HistoryScreen() {
    var items by remember { mutableStateOf<List<CalculationDto>>(emptyList()) }
    var isLoading by remember { mutableStateOf(true) }
    var errorMessage by remember { mutableStateOf<String?>(null) }
    var statusMessage by remember { mutableStateOf<String?>(null) }
    val scope = rememberCoroutineScope()

    fun refresh() {
        scope.launch {
            isLoading = true
            errorMessage = null
            statusMessage = null
            val outcome = withContext(Dispatchers.IO) {
                try {
                    Result.success(ApiClient.api.getCalculations())
                } catch (e: Exception) {
                    Result.failure(e)
                }
            }
            outcome
                .onSuccess {
                    items = it
                    isLoading = false
                }
                .onFailure {
                    items = emptyList()
                    errorMessage = "Could not load history. Is the backend running?"
                    isLoading = false
                }
        }
    }

    LaunchedEffect(Unit) {
        refresh()
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp)
    ) {
        Text(
            text = "History",
            style = MaterialTheme.typography.headlineMedium,
            color = MaterialTheme.colorScheme.primary
        )
        Text(
            text = "Saved calculations from the AgeLens API",
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )

        Spacer(modifier = Modifier.height(12.dp))

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Button(onClick = { refresh() }) {
                Text("Refresh")
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        errorMessage?.let {
            Text(
                text = it,
                color = MaterialTheme.colorScheme.error,
                style = MaterialTheme.typography.bodySmall
            )
            Spacer(modifier = Modifier.height(8.dp))
        }

        statusMessage?.let {
            Text(
                text = it,
                color = MaterialTheme.colorScheme.tertiary,
                style = MaterialTheme.typography.bodySmall
            )
            Spacer(modifier = Modifier.height(8.dp))
        }

        when {
            isLoading -> {
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    CircularProgressIndicator()
                }
            }
            items.isEmpty() && errorMessage == null -> {
                Text(
                    text = "No saved calculations yet. Save one from Home.",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
            else -> {
                LazyColumn(
                    verticalArrangement = Arrangement.spacedBy(12.dp),
                    modifier = Modifier.fillMaxSize()
                ) {
                    items(items, key = { it.id }) { item ->
                        HistoryItemCard(
                            item = item,
                            onDelete = {
                                scope.launch {
                                    val deleted = withContext(Dispatchers.IO) {
                                        try {
                                            ApiClient.api.deleteCalculation(item.id)
                                            true
                                        } catch (_: Exception) {
                                            false
                                        }
                                    }
                                    if (deleted) {
                                        items = items.filterNot { it.id == item.id }
                                        statusMessage = "Deleted"
                                        errorMessage = null
                                    } else {
                                        errorMessage = "Delete failed. Check the backend connection."
                                    }
                                }
                            }
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun HistoryItemCard(
    item: CalculationDto,
    onDelete: () -> Unit
) {
    val ageSummary = buildAgeSummary(item.result)

    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surfaceVariant
        )
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(
                text = item.name?.takeIf { it.isNotBlank() } ?: "Unnamed",
                style = MaterialTheme.typography.titleMedium
            )
            Text(
                text = "DOB: ${item.birthDate}",
                style = MaterialTheme.typography.bodyMedium
            )
            Text(
                text = "Type: ${item.calculationType}",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            if (ageSummary != null) {
                Text(
                    text = ageSummary,
                    style = MaterialTheme.typography.bodyMedium
                )
            }
            item.createdAt?.let {
                Text(
                    text = "Saved: $it",
                    style = MaterialTheme.typography.labelSmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }

            Spacer(modifier = Modifier.height(8.dp))

            TextButton(onClick = onDelete) {
                Text("Delete", color = MaterialTheme.colorScheme.error)
            }
        }
    }
}

private fun buildAgeSummary(result: Map<String, Any?>?): String? {
    if (result == null) return null
    val years = result["years"]
    val months = result["months"]
    val days = result["days"]
    if (years == null || months == null || days == null) return null
    return "Age: ${asInt(years)}y ${asInt(months)}m ${asInt(days)}d"
}

/** Gson may decode numbers as Double — normalize for display. */
private fun asInt(value: Any?): String {
    return when (value) {
        is Number -> value.toInt().toString()
        else -> value?.toString() ?: "?"
    }
}
