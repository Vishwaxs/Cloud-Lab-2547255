import javax.swing.*;
import java.awt.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;

// Main class for the chess game
class Chess {
    private static final int BOARD_SIZE = 8;
    private JButton[][] squares = new JButton[BOARD_SIZE][BOARD_SIZE];
    private ChessPiece[][] board = new ChessPiece[BOARD_SIZE][BOARD_SIZE];
    private boolean whiteTurn = true;
    private ChessPiece selectedPiece = null;
    private JLabel turnLabel;
    private java.util.List<Point> highlightedSquares = new java.util.ArrayList<>();
    private java.util.Stack<Move> moveHistory = new java.util.Stack<>();
    private boolean gameOver = false;
    private String gameResult = "";
    private Point enPassantTarget = null; // For en passant move
    private boolean whiteKingMoved = false;
    private boolean blackKingMoved = false;
    private boolean whiteLeftRookMoved = false;
    private boolean whiteRightRookMoved = false;
    private boolean blackLeftRookMoved = false;
    private boolean blackRightRookMoved = false;
    private boolean aiMode = false;
    private boolean aiIsWhite = false;
    private String whitePlayerName = "White";
    private String blackPlayerName = "Black";
    private JLabel statusLabel;

    public Chess() {
        // Get player names and color preferences
        setupPlayers();
        
        JFrame frame = new JFrame("Chess Game - " + whitePlayerName + " vs " + blackPlayerName);
        frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        frame.setSize(820, 900);
        frame.setLayout(new BorderLayout());

        JPanel boardPanel = new JPanel(new GridLayout(BOARD_SIZE, BOARD_SIZE));
        for (int row = 0; row < BOARD_SIZE; row++) {
            for (int col = 0; col < BOARD_SIZE; col++) {
                JButton square = new JButton();
                square.setPreferredSize(new Dimension(80, 80));
                square.setBackground((row + col) % 2 == 0 ? Color.WHITE : Color.GRAY);
                final int currentRow = row;
                final int currentCol = col;
                square.addActionListener(new ActionListener() {
                    @Override
                    public void actionPerformed(ActionEvent e) {
                        handleSquareClick(currentRow, currentCol);
                    }
                });
                squares[row][col] = square;
                boardPanel.add(square);
            }
        }

        turnLabel = new JLabel("Turn: " + whitePlayerName, SwingConstants.CENTER);
        turnLabel.setFont(new Font("Arial", Font.BOLD, 24));
        
        statusLabel = new JLabel("Game in progress", SwingConstants.CENTER);
        statusLabel.setFont(new Font("Arial", Font.PLAIN, 18));
        statusLabel.setForeground(Color.BLUE);
        
        JPanel topPanel = new JPanel(new GridLayout(2, 1));
        topPanel.add(turnLabel);
        topPanel.add(statusLabel);
        
        frame.add(topPanel, BorderLayout.NORTH);
        frame.add(boardPanel, BorderLayout.CENTER);

        JButton undoButton = new JButton("Undo");
        undoButton.setFont(new Font("Arial", Font.BOLD, 18));
        undoButton.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                undoMove();
            }
        });
        frame.add(undoButton, BorderLayout.SOUTH);

        initializeBoard();
        updateBoard();

        frame.setVisible(true);
        
        // If AI is white, make the first move
        if (aiMode && aiIsWhite) {
            SwingUtilities.invokeLater(() -> makeAIMove());
        }
    }

    private void setupPlayers() {
        // Ask for game mode first
        String[] gameOptions = {"Human vs Human", "Human vs AI"};
        String gameChoice = (String) JOptionPane.showInputDialog(null, 
            "Choose game mode:", "Chess Game Mode",
            JOptionPane.QUESTION_MESSAGE, null, gameOptions, gameOptions[0]);
        
        if (gameChoice == null) gameChoice = gameOptions[0];
        
        if (gameChoice.equals("Human vs AI")) {
            aiMode = true;
            
            // Ask player for their name with validation
            String playerName = getValidPlayerName("Enter your name:", "Player Name");
            
            // Ask which color they want
            String[] colorOptions = {"White (you go first)", "Black (AI goes first)"};
            String colorChoice = (String) JOptionPane.showInputDialog(null, 
                "Choose your color:", "Color Selection",
                JOptionPane.QUESTION_MESSAGE, null, colorOptions, colorOptions[0]);
            
            if (colorChoice == null) colorChoice = colorOptions[0];
            
            if (colorChoice.contains("White")) {
                whitePlayerName = playerName;
                blackPlayerName = "AI";
                aiIsWhite = false;
            } else {
                whitePlayerName = "AI";
                blackPlayerName = playerName;
                aiIsWhite = true;
            }
        } else {
            // Human vs Human
            aiMode = false;
            
            // Get player names with validation
            String player1 = getValidPlayerName("Enter name for White player:", "White Player Name");
            String player2 = getValidPlayerName("Enter name for Black player:", "Black Player Name");
            
            // Ensure player names are different
            while (player1.equalsIgnoreCase(player2)) {
                JOptionPane.showMessageDialog(null, 
                    "Player names must be different!\nWhite player: " + player1, 
                    "Duplicate Names", JOptionPane.WARNING_MESSAGE);
                player2 = getValidPlayerName("Enter a different name for Black player:", "Black Player Name");
            }
            
            whitePlayerName = player1;
            blackPlayerName = player2;
        }
    }
    
    private String getValidPlayerName(String message, String title) {
        String name = null;
        boolean validName = false;
        
        while (!validName) {
            name = JOptionPane.showInputDialog(null, message, title, JOptionPane.QUESTION_MESSAGE);
            
            // Handle cancel button
            if (name == null) {
                int choice = JOptionPane.showConfirmDialog(null, 
                    "Do you want to exit the game?", "Confirm Exit", 
                    JOptionPane.YES_NO_OPTION, JOptionPane.QUESTION_MESSAGE);
                if (choice == JOptionPane.YES_OPTION) {
                    System.exit(0);
                } else {
                    continue; // Ask for name again
                }
            }
            
            // Trim whitespace
            name = name.trim();
            
            // Validate name
            if (name.isEmpty()) {
                JOptionPane.showMessageDialog(null, 
                    "Name cannot be empty! Please enter a valid name.", 
                    "Invalid Name", JOptionPane.ERROR_MESSAGE);
            } else if (name.length() > 20) {
                JOptionPane.showMessageDialog(null, 
                    "Name is too long! Please enter a name with 20 characters or less.", 
                    "Invalid Name", JOptionPane.ERROR_MESSAGE);
            } else if (name.length() < 2) {
                JOptionPane.showMessageDialog(null, 
                    "Name is too short! Please enter a name with at least 2 characters.", 
                    "Invalid Name", JOptionPane.ERROR_MESSAGE);
            } else if (!name.matches("[a-zA-Z0-9\\s]+")) {
                JOptionPane.showMessageDialog(null, 
                    "Name can only contain letters, numbers, and spaces!", 
                    "Invalid Name", JOptionPane.ERROR_MESSAGE);
            } else if (name.equalsIgnoreCase("AI") || name.equalsIgnoreCase("Computer")) {
                JOptionPane.showMessageDialog(null, 
                    "This name is reserved! Please choose a different name.", 
                    "Reserved Name", JOptionPane.ERROR_MESSAGE);
            } else {
                validName = true;
            }
        }
        
        return name;
    }

    private void initializeBoard() {
        // Pawns
        for (int col = 0; col < BOARD_SIZE; col++) {
            board[1][col] = new Pawn(1, col, "black");
            board[6][col] = new Pawn(6, col, "white");
        }

        // Rooks
        board[0][0] = new Rook(0, 0, "black");
        board[0][7] = new Rook(0, 7, "black");
        board[7][0] = new Rook(7, 0, "white");
        board[7][7] = new Rook(7, 7, "white");

        // Knights
        board[0][1] = new Knight(0, 1, "black");
        board[0][6] = new Knight(0, 6, "black");
        board[7][1] = new Knight(7, 1, "white");
        board[7][6] = new Knight(7, 6, "white");

        // Bishops
        board[0][2] = new Bishop(0, 2, "black");
        board[0][5] = new Bishop(0, 5, "black");
        board[7][2] = new Bishop(7, 2, "white");
        board[7][5] = new Bishop(7, 5, "white");

        // Kings
        board[0][4] = new King(0, 4, "black");
        board[7][4] = new King(7, 4, "white");

        // Queens
        board[0][3] = new Queen(0, 3, "black");
        board[7][3] = new Queen(7, 3, "white");
    }

    private void updateBoard() {
        for (int row = 0; row < BOARD_SIZE; row++) {
            for (int col = 0; col < BOARD_SIZE; col++) {
                if (board[row][col] != null) {
                    squares[row][col].setText(board[row][col].getSymbol());
                    squares[row][col].setFont(new Font("Arial Unicode MS", Font.PLAIN, 32));
                } else {
                    squares[row][col].setText("");
                }
                // Highlight possible moves
                if (isHighlighted(row, col)) {
                    squares[row][col].setBackground(Color.YELLOW);
                } else {
                    squares[row][col].setBackground((row + col) % 2 == 0 ? Color.WHITE : Color.GRAY);
                }
            }
        }
        turnLabel.setText("Turn: " + (whiteTurn ? whitePlayerName : blackPlayerName) + 
                         (gameOver ? " - " + gameResult : ""));
        
        // Update status label with check/checkmate info
        String currentPlayerName = whiteTurn ? whitePlayerName : blackPlayerName;
        String currentColor = whiteTurn ? "white" : "black";
        
        if (gameOver) {
            statusLabel.setText(gameResult);
            statusLabel.setForeground(Color.RED);
        } else if (isInCheck(currentColor)) {
            statusLabel.setText(currentPlayerName + " is in CHECK!");
            statusLabel.setForeground(Color.RED);
        } else {
            statusLabel.setText("Game in progress");
            statusLabel.setForeground(Color.BLUE);
        }
    }

    private boolean isHighlighted(int row, int col) {
        for (Point p : highlightedSquares) {
            if (p.x == row && p.y == col) return true;
        }
        return false;
    }

    private void handleSquareClick(int row, int col) {
        if (gameOver) return;
        
        // In AI mode, only allow human moves on human's turn
        if (aiMode) {
            boolean isAITurn = (aiIsWhite && whiteTurn) || (!aiIsWhite && !whiteTurn);
            if (isAITurn) {
                return; // Block human input during AI turn
            }
        }
        
        ChessPiece piece = board[row][col];
        if (selectedPiece == null) {
            highlightedSquares.clear();
            if (piece != null && piece.color.equals(whiteTurn ? "white" : "black")) {
                // Check for castling click on king or rook
                if (piece instanceof King) {
                    King king = (King) piece;
                    if (canCastle(king, true)) {
                        performCastle(king, true);
                        return;
                    } else if (canCastle(king, false)) {
                        performCastle(king, false);
                        return;
                    }
                } else if (piece instanceof Rook) {
                    // Check if clicking rook can trigger castling
                    King king = findKing(piece.color);
                    if (king != null) {
                        boolean isKingside = piece.col == 7;
                        boolean isQueenside = piece.col == 0;
                        if (isKingside && canCastle(king, true)) {
                            performCastle(king, true);
                            return;
                        } else if (isQueenside && canCastle(king, false)) {
                            performCastle(king, false);
                            return;
                        }
                    }
                }
                
                selectedPiece = piece;
                // Highlight possible moves
                for (int r = 0; r < BOARD_SIZE; r++) {
                    for (int c = 0; c < BOARD_SIZE; c++) {
                        if (isValidMoveWithCheck(piece, r, c)) {
                            highlightedSquares.add(new Point(r, c));
                        }
                    }
                }
                updateBoard();
                System.out.println("Selected " + piece.getSymbol());
            }
        } else {
            if (isValidMoveWithCheck(selectedPiece, row, col)) {
                makeMove(selectedPiece, row, col);
                
                // Trigger AI move after human move
                if (aiMode && !gameOver) {
                    SwingUtilities.invokeLater(() -> {
                        try {
                            Thread.sleep(500); // Brief pause for better UX
                            makeAIMove();
                        } catch (InterruptedException e) {
                            Thread.currentThread().interrupt();
                        }
                    });
                }
            } else {
                System.out.println("Invalid move.");
                selectedPiece = null;
                highlightedSquares.clear();
                updateBoard();
            }
        }
    }

    private King findKing(String color) {
        for (int row = 0; row < BOARD_SIZE; row++) {
            for (int col = 0; col < BOARD_SIZE; col++) {
                if (board[row][col] instanceof King && board[row][col].color.equals(color)) {
                    return (King) board[row][col];
                }
            }
        }
        return null;
    }
    
    private void performCastle(King king, boolean kingside) {
        if (!canCastle(king, kingside)) return;
        
        String color = king.color;
        int row = king.row;
        int rookCol = kingside ? 7 : 0;
        int newKingCol = kingside ? 6 : 2;
        int newRookCol = kingside ? 5 : 3;
        
        ChessPiece rook = board[row][rookCol];
        
        // Save move to history for undo
        moveHistory.push(new Move(king, king.row, king.col, row, newKingCol, 
                                 null, true, false, null, enPassantTarget));
        
        // Update movement flags
        updateMovementFlags(king, king.row, king.col);
        updateMovementFlags(rook, rook.row, rook.col);
        
        // Move king
        board[king.row][king.col] = null;
        king.row = row;
        king.col = newKingCol;
        board[row][newKingCol] = king;
        
        // Move rook
        board[row][rookCol] = null;
        rook.row = row;
        rook.col = newRookCol;
        board[row][newRookCol] = rook;
        
        selectedPiece = null;
        highlightedSquares.clear();
        whiteTurn = !whiteTurn;
        
        System.out.println((color.equals("white") ? "White" : "Black") + 
                          " castled " + (kingside ? "kingside" : "queenside"));
        
        // Check for game end conditions
        checkGameEnd();
        updateBoard();
        
        // Trigger AI move after human castling
        if (aiMode && !gameOver) {
            SwingUtilities.invokeLater(() -> {
                try {
                    Thread.sleep(500);
                    makeAIMove();
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
            });
        }
    }

    // ...existing code...

    private boolean isValidMoveWithCheck(ChessPiece piece, int targetRow, int targetCol) {
        if (!piece.isValidMove(targetRow, targetCol, board)) {
            // Check for en passant if it's a pawn
            if (piece instanceof Pawn && isValidEnPassant((Pawn) piece, targetRow, targetCol)) {
                // Continue with check validation
            } else {
                return false;
            }
        }
        
        // Check for castling
        if (piece instanceof King && Math.abs(targetCol - piece.col) == 2) {
            return canCastle(piece, targetCol > piece.col);
        }
        
        // Simulate the move to check if it leaves the king in check
        ChessPiece originalPiece = board[targetRow][targetCol];
        int originalRow = piece.row;
        int originalCol = piece.col;
        
        board[piece.row][piece.col] = null;
        piece.row = targetRow;
        piece.col = targetCol;
        board[targetRow][targetCol] = piece;
        
        boolean wouldBeInCheck = isInCheck(piece.color);
        
        // Restore original state
        board[originalRow][originalCol] = piece;
        piece.row = originalRow;
        piece.col = originalCol;
        board[targetRow][targetCol] = originalPiece;
        
        return !wouldBeInCheck;
    }
    
    private boolean isValidEnPassant(Pawn pawn, int targetRow, int targetCol) {
        if (enPassantTarget == null) return false;
        
        int direction = pawn.color.equals("white") ? -1 : 1;
        
        // Check if target is the en passant square and pawn is moving diagonally
        return targetRow == pawn.row + direction && 
               targetCol != pawn.col && 
               Math.abs(targetCol - pawn.col) == 1 &&
               targetRow == enPassantTarget.x && 
               targetCol == enPassantTarget.y;
    }
    
    private void makeMove(ChessPiece piece, int targetRow, int targetCol) {
        ChessPiece capturedPiece = board[targetRow][targetCol];
        
        if (capturedPiece != null) {
            System.out.println("Captured " + capturedPiece.getSymbol());
        }
        
        // Handle special moves
        boolean isCastling = false;
        boolean isEnPassant = false;
        ChessPiece enPassantCaptured = null;
        
        // Check for castling
        if (piece instanceof King && Math.abs(targetCol - piece.col) == 2) {
            isCastling = true;
            boolean kingside = targetCol > piece.col;
            int rookCol = kingside ? 7 : 0;
            int newRookCol = kingside ? 5 : 3;
            ChessPiece rook = board[piece.row][rookCol];
            board[piece.row][rookCol] = null;
            rook.col = newRookCol;
            board[piece.row][newRookCol] = rook;
        }
        
        // Check for en passant
        if (piece instanceof Pawn && targetCol != piece.col && capturedPiece == null) {
            isEnPassant = true;
            enPassantCaptured = board[piece.row][targetCol];
            board[piece.row][targetCol] = null;
        }
        
        // Save move to history for undo
        moveHistory.push(new Move(piece, piece.row, piece.col, targetRow, targetCol, 
                                 capturedPiece, isCastling, isEnPassant, enPassantCaptured, enPassantTarget));
        
        // Update piece movement flags (before changing piece position)
        updateMovementFlags(piece, piece.row, piece.col);
        
        // Update pawn first move flag
        if (piece instanceof Pawn) {
            ((Pawn) piece).isFirstMove = false;
        }
        
        // Make the move
        board[piece.row][piece.col] = null;
        piece.row = targetRow;
        piece.col = targetCol;
        board[targetRow][targetCol] = piece;
        
        // Update en passant target
        enPassantTarget = null;
        if (piece instanceof Pawn && Math.abs(targetRow - moveHistory.peek().fromRow) == 2) {
            enPassantTarget = new Point((moveHistory.peek().fromRow + targetRow) / 2, targetCol);
        }
        
        // Check for pawn promotion
        if (piece instanceof Pawn && (targetRow == 0 || targetRow == 7)) {
            promotePawn((Pawn) piece);
        }
        
        selectedPiece = null;
        highlightedSquares.clear();
        whiteTurn = !whiteTurn;
        
        // Check for game end conditions
        checkGameEnd();
        updateBoard();
    }
    
    private boolean isInCheck(String color) {
        // Find the king
        King king = null;
        for (int row = 0; row < BOARD_SIZE; row++) {
            for (int col = 0; col < BOARD_SIZE; col++) {
                if (board[row][col] instanceof King && board[row][col].color.equals(color)) {
                    king = (King) board[row][col];
                    break;
                }
            }
        }
        
        if (king == null) return false;
        
        // Check if any enemy piece can attack the king
        String enemyColor = color.equals("white") ? "black" : "white";
        for (int row = 0; row < BOARD_SIZE; row++) {
            for (int col = 0; col < BOARD_SIZE; col++) {
                ChessPiece piece = board[row][col];
                if (piece != null && piece.color.equals(enemyColor)) {
                    if (piece.isValidMove(king.row, king.col, board)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
    
    private boolean canCastle(ChessPiece king, boolean kingside) {
        if (!(king instanceof King)) return false;
        
        String color = king.color;
        boolean kingMoved = color.equals("white") ? whiteKingMoved : blackKingMoved;
        if (kingMoved) return false;
        
        int row = king.row;
        int rookCol = kingside ? 7 : 0;
        boolean rookMoved = false;
        
        if (color.equals("white")) {
            rookMoved = kingside ? whiteRightRookMoved : whiteLeftRookMoved;
        } else {
            rookMoved = kingside ? blackRightRookMoved : blackLeftRookMoved;
        }
        
        if (rookMoved) return false;
        
        // Check if there's actually a rook at the expected position
        if (!(board[row][rookCol] instanceof Rook) || 
            !board[row][rookCol].color.equals(color)) {
            return false;
        }
        
        // Check if squares between king and rook are empty
        int start = Math.min(king.col, rookCol);
        int end = Math.max(king.col, rookCol);
        for (int col = start + 1; col < end; col++) {
            if (board[row][col] != null) return false;
        }
        
        // Check if king is in check or would pass through check
        if (isInCheck(color)) return false;
        
        int direction = kingside ? 1 : -1;
        for (int i = 1; i <= 2; i++) {
            int testCol = king.col + i * direction;
            // Simulate king move to test for check
            board[king.row][king.col] = null;
            int originalCol = king.col;
            king.col = testCol;
            board[king.row][testCol] = king;
            
            boolean inCheck = isInCheck(color);
            
            // Restore
            board[king.row][testCol] = null;
            king.col = originalCol;
            board[king.row][king.col] = king;
            
            if (inCheck) return false;
        }
        
        return true;
    }
    
    private void updateMovementFlags(ChessPiece piece, int originalRow, int originalCol) {
        if (piece instanceof King) {
            if (piece.color.equals("white")) {
                whiteKingMoved = true;
            } else {
                blackKingMoved = true;
            }
        } else if (piece instanceof Rook) {
            if (piece.color.equals("white")) {
                if (originalCol == 0) whiteLeftRookMoved = true;
                if (originalCol == 7) whiteRightRookMoved = true;
            } else {
                if (originalCol == 0) blackLeftRookMoved = true;
                if (originalCol == 7) blackRightRookMoved = true;
            }
        }
    }
    
    private void promotePawn(Pawn pawn) {
        String[] options = {"Queen", "Rook", "Bishop", "Knight"};
        String choice = (String) JOptionPane.showInputDialog(null, 
            "Choose piece for pawn promotion:", "Pawn Promotion",
            JOptionPane.QUESTION_MESSAGE, null, options, options[0]);
        
        if (choice == null) choice = "Queen";
        
        ChessPiece newPiece;
        switch (choice) {
            case "Rook":
                newPiece = new Rook(pawn.row, pawn.col, pawn.color);
                break;
            case "Bishop":
                newPiece = new Bishop(pawn.row, pawn.col, pawn.color);
                break;
            case "Knight":
                newPiece = new Knight(pawn.row, pawn.col, pawn.color);
                break;
            default:
                newPiece = new Queen(pawn.row, pawn.col, pawn.color);
        }
        
        board[pawn.row][pawn.col] = newPiece;
    }
    
    private void checkGameEnd() {
        String currentColor = whiteTurn ? "white" : "black";
        boolean hasValidMoves = false;
        
        // Check if current player has any valid moves
        for (int row = 0; row < BOARD_SIZE && !hasValidMoves; row++) {
            for (int col = 0; col < BOARD_SIZE && !hasValidMoves; col++) {
                ChessPiece piece = board[row][col];
                if (piece != null && piece.color.equals(currentColor)) {
                    for (int r = 0; r < BOARD_SIZE && !hasValidMoves; r++) {
                        for (int c = 0; c < BOARD_SIZE && !hasValidMoves; c++) {
                            if (isValidMoveWithCheck(piece, r, c)) {
                                hasValidMoves = true;
                            }
                        }
                    }
                }
            }
        }
        
        if (!hasValidMoves) {
            gameOver = true;
            if (isInCheck(currentColor)) {
                String winnerName = currentColor.equals("white") ? 
                    (whiteTurn ? blackPlayerName : whitePlayerName) : 
                    (whiteTurn ? whitePlayerName : blackPlayerName);
                gameResult = winnerName + " wins by checkmate!";
            } else {
                gameResult = "Stalemate! It's a draw.";
            }
        }
    }
    
    private void makeAIMove() {
        if (gameOver) return;
        
        String aiColor = aiIsWhite ? "white" : "black";
        boolean isAITurn = (aiIsWhite && whiteTurn) || (!aiIsWhite && !whiteTurn);
        
        if (!isAITurn) return; // Not AI's turn
        
        java.util.List<AIMove> possibleMoves = new java.util.ArrayList<>();
        
        // Find all valid moves for AI
        for (int row = 0; row < BOARD_SIZE; row++) {
            for (int col = 0; col < BOARD_SIZE; col++) {
                ChessPiece piece = board[row][col];
                if (piece != null && piece.color.equals(aiColor)) {
                    for (int r = 0; r < BOARD_SIZE; r++) {
                        for (int c = 0; c < BOARD_SIZE; c++) {
                            if (isValidMoveWithCheck(piece, r, c)) {
                                possibleMoves.add(new AIMove(piece, r, c));
                            }
                        }
                    }
                }
            }
        }
        
        if (!possibleMoves.isEmpty()) {
            // Choose a random move (simple AI)
            java.util.Random random = new java.util.Random();
            AIMove chosenMove = possibleMoves.get(random.nextInt(possibleMoves.size()));
            
            System.out.println("AI moves " + chosenMove.piece.getSymbol() + 
                             " from " + (char)('a' + chosenMove.piece.col) + (8 - chosenMove.piece.row) +
                             " to " + (char)('a' + chosenMove.toCol) + (8 - chosenMove.toRow));
            
            makeMove(chosenMove.piece, chosenMove.toRow, chosenMove.toCol);
        }
    }

    private void undoMove() {
        if (!moveHistory.isEmpty()) {
            Move lastMove = moveHistory.pop();
            ChessPiece movedPiece = lastMove.piece;
            
            // Restore the piece position
            board[lastMove.toRow][lastMove.toCol] = lastMove.capturedPiece;
            movedPiece.row = lastMove.fromRow;
            movedPiece.col = lastMove.fromCol;
            board[lastMove.fromRow][lastMove.fromCol] = movedPiece;
            
            // Handle special move undos
            if (lastMove.isCastling) {
                // Undo castling - move rook back
                boolean kingside = lastMove.toCol > lastMove.fromCol;
                int rookFromCol = kingside ? 5 : 3;
                int rookToCol = kingside ? 7 : 0;
                ChessPiece rook = board[lastMove.fromRow][rookFromCol];
                board[lastMove.fromRow][rookFromCol] = null;
                rook.col = rookToCol;
                board[lastMove.fromRow][rookToCol] = rook;
            }
            
            if (lastMove.isEnPassant) {
                // Restore en passant captured pawn
                board[lastMove.fromRow][lastMove.toCol] = lastMove.enPassantCaptured;
            }
            
            // Restore en passant target
            enPassantTarget = lastMove.previousEnPassantTarget;
            
            // Restore movement flags (simplified - would need more tracking for full accuracy)
            whiteTurn = !whiteTurn;
            selectedPiece = null;
            highlightedSquares.clear();
            gameOver = false;
            gameResult = "";
            updateBoard();
        }
    }

    private static class Move {
        ChessPiece piece;
        int fromRow, fromCol, toRow, toCol;
        ChessPiece capturedPiece;
        boolean isCastling;
        boolean isEnPassant;
        ChessPiece enPassantCaptured;
        Point previousEnPassantTarget;
        
        Move(ChessPiece piece, int fromRow, int fromCol, int toRow, int toCol, ChessPiece capturedPiece,
             boolean isCastling, boolean isEnPassant, ChessPiece enPassantCaptured, Point previousEnPassantTarget) {
            this.piece = piece;
            this.fromRow = fromRow;
            this.fromCol = fromCol;
            this.toRow = toRow;
            this.toCol = toCol;
            this.capturedPiece = capturedPiece;
            this.isCastling = isCastling;
            this.isEnPassant = isEnPassant;
            this.enPassantCaptured = enPassantCaptured;
            this.previousEnPassantTarget = previousEnPassantTarget;
        }
    }
    
    private static class AIMove {
        ChessPiece piece;
        int toRow, toCol;
        
        AIMove(ChessPiece piece, int toRow, int toCol) {
            this.piece = piece;
            this.toRow = toRow;
            this.toCol = toCol;
        }
    }

    public static void main(String[] args) {
        new Chess();
    }
}

abstract class ChessPiece {
    protected int row;
    protected int col;
    protected String color;

    public ChessPiece(int row, int col, String color) {
        this.row = row;
        this.col = col;
        this.color = color;
    }

    public abstract boolean isValidMove(int targetRow, int targetCol, ChessPiece[][] board);

    public abstract String getSymbol();
}

class Pawn extends ChessPiece {
    protected boolean isFirstMove;

    public Pawn(int row, int col, String color) {
        super(row, col, color);
        this.isFirstMove = true;
    }

    @Override
    public boolean isValidMove(int targetRow, int targetCol, ChessPiece[][] board) {
        int direction = color.equals("white") ? -1 : 1;

        // Regular pawn move forward
        if (targetRow == row + direction && targetCol == col && board[targetRow][targetCol] == null) {
            return true;
        }

        // Two squares on first move
        if (isFirstMove && targetRow == row + 2 * direction && targetCol == col && 
            board[targetRow][targetCol] == null && board[row + direction][col] == null) {
            return true;
        }

        // Diagonal capture
        if (targetRow == row + direction && (targetCol == col - 1 || targetCol == col + 1) && 
            board[targetRow][targetCol] != null && !board[targetRow][targetCol].color.equals(color)) {
            return true;
        }
        
        // En passant capture (to be implemented with chess instance reference)
        return false;
    }

    @Override
    public String getSymbol() {
        return color.equals("white") ? "♙" : "♟";
    }
}

class Rook extends ChessPiece {
    public Rook(int row, int col, String color) {
        super(row, col, color);
    }

    @Override
    public boolean isValidMove(int targetRow, int targetCol, ChessPiece[][] board) {
        if (row == targetRow || col == targetCol) {
            int rowStep = Integer.compare(targetRow, row);
            int colStep = Integer.compare(targetCol, col);
            int r = row + rowStep;
            int c = col + colStep;
            while (r != targetRow || c != targetCol) {
                if (board[r][c] != null) {
                    return false;
                }
                r += rowStep;
                c += colStep;
            }

            if (board[targetRow][targetCol] != null && board[targetRow][targetCol].color.equals(color)) {
                return false;
            }
            return true;
        }
        return false;
    }

    @Override
    public String getSymbol() {
        return color.equals("white") ? "♖" : "♜";
    }
}

class Knight extends ChessPiece {
    public Knight(int row, int col, String color) {
        super(row, col, color);
    }

    @Override
    public boolean isValidMove(int targetRow, int targetCol, ChessPiece[][] board) {
        int rowDiff = Math.abs(targetRow - row);
        int colDiff = Math.abs(targetCol - col);

        if ((rowDiff == 2 && colDiff == 1) || (rowDiff == 1 && colDiff == 2)) {
            if (board[targetRow][targetCol] != null && board[targetRow][targetCol].color.equals(color)) {
                return false;
            }
            return true;
        }
        return false;
    }

    @Override
    public String getSymbol() {
        return color.equals("white") ? "♘" : "♞";
    }
}

class Bishop extends ChessPiece {
    public Bishop(int row, int col, String color) {
        super(row, col, color);
    }

    @Override
    public boolean isValidMove(int targetRow, int targetCol, ChessPiece[][] board) {
        if (Math.abs(targetRow - row) == Math.abs(targetCol - col)) {
            int rowStep = Integer.compare(targetRow, row);
            int colStep = Integer.compare(targetCol, col);
            int r = row + rowStep;
            int c = col + colStep;
            while (r != targetRow || c != targetCol) {
                if (board[r][c] != null) {
                    return false;
                }
                r += rowStep;
                c += colStep;
            }

            if (board[targetRow][targetCol] != null && board[targetRow][targetCol].color.equals(color)) {
                return false;
            }
            return true;
        }
        return false;
    }

    @Override
    public String getSymbol() {
        return color.equals("white") ? "♗" : "♝";
    }
}

class King extends ChessPiece {
    public King(int row, int col, String color) {
        super(row, col, color);
    }

    @Override
    public boolean isValidMove(int targetRow, int targetCol, ChessPiece[][] board) {
        int rowDiff = Math.abs(targetRow - row);
        int colDiff = Math.abs(targetCol - col);

        // Allow normal king moves (1 square) or castling moves (2 squares horizontally)
        if ((rowDiff <= 1 && colDiff <= 1) || (rowDiff == 0 && colDiff == 2)) {
            if (board[targetRow][targetCol] != null && board[targetRow][targetCol].color.equals(color)) {
                return false;
            }
            return true;
        }
        return false;
    }

    @Override
    public String getSymbol() {
        return color.equals("white") ? "♔" : "♚";
    }
}

class Queen extends ChessPiece {
    public Queen(int row, int col, String color) {
        super(row, col, color);
    }

    @Override
    public boolean isValidMove(int targetRow, int targetCol, ChessPiece[][] board) {
        if (row == targetRow || col == targetCol || Math.abs(targetRow - row) == Math.abs(targetCol - col)) {
            int rowStep = Integer.compare(targetRow, row);
            int colStep = Integer.compare(targetCol, col);
            int r = row + rowStep;
            int c = col + colStep;
            while (r != targetRow || c != targetCol) {
                if (board[r][c] != null) {
                    return false;
                }
                r += rowStep;
                c += colStep;
            }

            if (board[targetRow][targetCol] != null && board[targetRow][targetCol].color.equals(color)) {
                return false;
            }
            return true;
        }
        return false;
    }

    @Override
    public String getSymbol() {
        return color.equals("white") ? "♕" : "♛";
    }
}
