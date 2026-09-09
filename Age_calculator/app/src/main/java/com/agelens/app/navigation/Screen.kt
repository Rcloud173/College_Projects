package com.agelens.app.navigation

/**
 * Bottom navigation destinations for AgeLens.
 * Routes stay simple so they are easy to explain in a viva.
 */
sealed class Screen(val route: String, val title: String) {
    data object Home : Screen("home", "Home")
    data object Life : Screen("life", "Life")
    data object Tools : Screen("tools", "Tools")
    data object History : Screen("history", "History")

    companion object {
        val bottomNavItems = listOf(Home, Life, Tools, History)
    }
}
