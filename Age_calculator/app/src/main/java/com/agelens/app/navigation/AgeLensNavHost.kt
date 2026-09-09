package com.agelens.app.navigation

import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.safeDrawingPadding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Calculate
import androidx.compose.material.icons.filled.CalendarMonth
import androidx.compose.material.icons.filled.GridView
import androidx.compose.material.icons.filled.History
import androidx.compose.material3.Icon
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.navigation.NavDestination.Companion.hierarchy
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import com.agelens.app.screens.difference.DifferenceScreen
import com.agelens.app.screens.historical.HistoricalScreen
import com.agelens.app.screens.history.HistoryScreen
import com.agelens.app.screens.home.HomeScreen
import com.agelens.app.screens.lifeweeks.LifeWeeksScreen
import com.agelens.app.screens.tools.ToolsScreen

@Composable
fun AgeLensNavHost() {
    val navController = rememberNavController()
    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentDestination = navBackStackEntry?.destination

    // Hide bottom bar on nested tool screens so focus stays on the form.
    val showBottomBar = currentDestination?.route in Screen.bottomNavItems.map { it.route }

    Scaffold(
        modifier = Modifier.safeDrawingPadding(),
        bottomBar = {
            if (showBottomBar) {
                NavigationBar {
                    Screen.bottomNavItems.forEach { screen ->
                        NavigationBarItem(
                            selected = currentDestination?.hierarchy?.any {
                                it.route == screen.route
                            } == true,
                            onClick = {
                                navController.navigate(screen.route) {
                                    popUpTo(navController.graph.findStartDestination().id) {
                                        saveState = true
                                    }
                                    launchSingleTop = true
                                    restoreState = true
                                }
                            },
                            icon = {
                                Icon(
                                    imageVector = iconFor(screen),
                                    contentDescription = screen.title
                                )
                            },
                            label = { Text(screen.title) }
                        )
                    }
                }
            }
        }
    ) { innerPadding ->
        NavHost(
            navController = navController,
            startDestination = Screen.Home.route,
            modifier = Modifier.padding(innerPadding)
        ) {
            composable(Screen.Home.route) {
                HomeScreen()
            }
            composable(Screen.Life.route) {
                LifeWeeksScreen()
            }
            composable(Screen.Tools.route) {
                ToolsScreen(
                    onOpenDifference = {
                        navController.navigate("difference")
                    },
                    onOpenHistorical = {
                        navController.navigate("historical")
                    }
                )
            }
            composable(Screen.History.route) {
                HistoryScreen()
            }
            composable("difference") {
                DifferenceScreen(onBack = { navController.popBackStack() })
            }
            composable("historical") {
                HistoricalScreen(onBack = { navController.popBackStack() })
            }
        }
    }
}

private fun iconFor(screen: Screen): ImageVector = when (screen) {
    Screen.Home -> Icons.Filled.CalendarMonth
    Screen.Life -> Icons.Filled.GridView
    Screen.Tools -> Icons.Filled.Calculate
    Screen.History -> Icons.Filled.History
}
