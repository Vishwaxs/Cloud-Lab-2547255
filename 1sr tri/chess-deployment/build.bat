@echo off
echo Compiling Chess Game...
javac chess.java
if errorlevel 1 (
    echo Compilation failed!
    pause
    exit /b 1
)

echo Creating JAR file...
jar cfm chess-game.jar MANIFEST.MF *.class
if errorlevel 1 (
    echo JAR creation failed!
    pause
    exit /b 1
)

echo Chess game JAR created successfully!
echo You can run it with: java -jar chess-game.jar
pause
