package com.agelens.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Surface
import androidx.compose.ui.Modifier
import com.agelens.app.navigation.AgeLensNavHost
import com.agelens.app.ui.theme.AgeLensTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            AgeLensTheme {
                Surface(modifier = Modifier.fillMaxSize()) {
                    AgeLensNavHost()
                }
            }
        }
    }
}
