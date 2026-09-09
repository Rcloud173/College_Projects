@ECHO OFF
@rem Gradle start-up script for Windows
@rem Generated for AgeLens Phase 1

SETLOCAL

SET DIRNAME=%~dp0
IF "%DIRNAME%"=="" SET DIRNAME=.
SET APP_BASE_NAME=%~n0
SET APP_HOME=%DIRNAME%

@rem Resolve any "." and ".." in APP_HOME
FOR %%i IN ("%APP_HOME%") DO SET APP_HOME=%%~fi

SET DEFAULT_JVM_OPTS="-Xmx64m" "-Xms64m"

@rem Find java.exe
IF DEFINED JAVA_HOME GOTO findJavaFromJavaHome

SET JAVA_EXE=java.exe
%JAVA_EXE% -version >NUL 2>&1
IF %ERRORLEVEL% EQU 0 GOTO execute

ECHO.
ECHO ERROR: JAVA_HOME is not set and no 'java' command could be found in your PATH.
ECHO.
ECHO Please set JAVA_HOME or open this project in Android Studio.
GOTO fail

:findJavaFromJavaHome
SET JAVA_HOME=%JAVA_HOME:"=%
SET JAVA_EXE=%JAVA_HOME%/bin/java.exe

IF EXIST "%JAVA_EXE%" GOTO execute

ECHO.
ECHO ERROR: JAVA_HOME is set to an invalid directory: %JAVA_HOME%
ECHO.
GOTO fail

:execute
SET CLASSPATH=%APP_HOME%\gradle\wrapper\gradle-wrapper.jar

"%JAVA_EXE%" %DEFAULT_JVM_OPTS% %JAVA_OPTS% %GRADLE_OPTS% "-Dorg.gradle.appname=%APP_BASE_NAME%" -classpath "%CLASSPATH%" org.gradle.wrapper.GradleWrapperMain %*

:end
IF %ERRORLEVEL% EQU 0 GOTO mainEnd

:fail
EXIT /B 1

:mainEnd
ENDLOCAL
