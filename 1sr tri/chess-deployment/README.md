# 🏆 Advanced Chess Game

A feature-rich chess game built in Java Swing with comprehensive gameplay features and AI opponent.

![Chess Game](https://img.shields.io/badge/Java-Swing-orange) ![Version](https://img.shields.io/badge/version-1.0-blue) ![License](https://img.shields.io/badge/license-MIT-green)

## 🎮 How to Play

### Download & Run
1. **Download:** [chess-game.jar](https://github.com/YourUsername/chess-game/releases/latest)
2. **Run:** Double-click the JAR file or use command: `java -jar chess-game.jar`
3. **Requirements:** Java 8 or higher

### Game Modes
- 🧑‍🤝‍🧑 **Human vs Human** - Play with friends locally
- 🤖 **Human vs AI** - Challenge the computer opponent

## ✨ Features

### 🎯 Core Gameplay
- ✅ **Complete Chess Rules** - All official chess rules implemented
- ✅ **Check & Checkmate Detection** - Visual indicators and game end detection
- ✅ **Stalemate Detection** - Proper draw conditions
- ✅ **Move Validation** - Prevents illegal moves

### 🏰 Special Moves
- ✅ **Castling** - One-click castling (click king or rook)
- ✅ **En Passant** - Pawn special capture move
- ✅ **Pawn Promotion** - Choose piece when pawn reaches end

### 🎨 User Interface
- ✅ **Unicode Chess Pieces** - Beautiful piece symbols (♔♕♖♗♘♙)
- ✅ **Move Highlighting** - Visual feedback for possible moves
- ✅ **Turn Indicators** - Clear display of current player
- ✅ **Status Display** - Check warnings and game status

### 🎪 Enhanced Features
- ✅ **Player Name Customization** - Enter custom player names
- ✅ **Input Validation** - Name validation with error handling
- ✅ **Move History** - Undo moves with full game state restoration
- ✅ **AI Opponent** - Computer player with move validation

## 🎲 Player Name Validation

### Rules:
- 📝 **Length:** 2-20 characters
- 🔤 **Characters:** Letters, numbers, and spaces only
- 🚫 **Reserved:** Cannot use "AI" or "Computer"
- 👥 **Unique:** Player names must be different
- ❌ **No Empty:** Names cannot be blank

### Error Handling:
- Clear error messages for each validation rule
- Persistent prompts until valid input
- Confirmation dialog for cancellation

## 🤖 AI Features

- 🎯 **Move Validation** - AI follows all chess rules
- 🎲 **Random Strategy** - Unpredictable but legal moves
- ⚡ **Instant Response** - Quick move calculation
- 🔄 **Turn Management** - Proper alternation with human player

## 🎮 Controls

### Mouse Controls:
- **Click** piece to select
- **Click** destination to move
- **Click** king/rook for castling
- **Dialog boxes** for pawn promotion

### Buttons:
- **Undo** - Revert last move
- **Exit** - Close game (with confirmation)

## 🛠️ Technical Details

- **Language:** Java 8+
- **Framework:** Swing GUI
- **Architecture:** Object-oriented design
- **File Size:** ~17 KB
- **Platform:** Cross-platform (Windows, Mac, Linux)

## 📋 System Requirements

- ☕ **Java Runtime Environment (JRE) 8 or higher**
- 💾 **Memory:** Minimal (< 50 MB RAM)
- 💽 **Storage:** < 1 MB
- 🖥️ **OS:** Windows, macOS, or Linux

## 🚀 Quick Start

```bash
# Download the JAR file
wget https://github.com/YourUsername/chess-game/releases/latest/download/chess-game.jar

# Run the game
java -jar chess-game.jar
```

## 🎯 Game Rules Implemented

### Basic Moves:
- ♟️ **Pawns** - Forward movement, diagonal capture, first-move double step
- 🏰 **Rooks** - Horizontal and vertical movement
- 🐎 **Knights** - L-shaped movement
- ⛪ **Bishops** - Diagonal movement
- 👑 **Queen** - Combined rook and bishop movement
- 👑 **King** - One square in any direction

### Special Rules:
- 🏰 **Castling** - King and rook special move
- 👻 **En Passant** - Pawn special capture
- 🎭 **Pawn Promotion** - Transform pawn to any piece
- ⚠️ **Check** - King attack detection
- ☠️ **Checkmate** - Game end condition
- 🤝 **Stalemate** - Draw condition

## 🐛 Bug Reports

Found a bug? Please report it with:
- Steps to reproduce
- Expected vs actual behavior
- Java version
- Operating system

## 📄 License

This project is open source and available under the MIT License.

---

**Enjoy playing chess! 🎉**
