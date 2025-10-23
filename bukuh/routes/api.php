<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\{
    AuthController, BookController, BorrowController,
    AttendanceController, ReadController, AdminController
};

/*
|--------------------------------------------------------------
| Public
|--------------------------------------------------------------
*/
Route::get('/ping', fn () => response()->json([
    'message' => 'Backend up',
    'client'  => 'react-ready',
]));

Route::post('/login',    [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']); // optional

Route::get('/books',        [BookController::class, 'index']);
Route::get('/books/{book}', [BookController::class, 'show']);

/*
|--------------------------------------------------------------
| Protected (Auth: Sanctum)
|--------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class,'me']);

    // ---------- USER AREA ----------
    // Peminjaman: user hanya mengajukan (pending). Admin yang approve/reject.
    Route::post('/borrow',                     [BorrowController::class, 'requestBorrow']);
    Route::post('/borrow/{borrow}/return',     [BorrowController::class, 'returnBook']);
    Route::get('/my/borrows',                  [BorrowController::class, 'myBorrows']);

    // Fitur user lain (hadir & progress baca)
    Route::post('/attendance',                 [AttendanceController::class, 'checkin']);
    Route::post('/read/progress',              [ReadController::class, 'updateProgress']);
    Route::get('/read/history',                [ReadController::class, 'history']);

    // ---------- ADMIN AREA ----------
    Route::prefix('admin')->group(function () {
        // Borrow moderation
        Route::get('/borrows',                         [BorrowController::class, 'index']);       // ?status=pending|approved|...
        Route::post('/borrows/{borrow}/approve',       [BorrowController::class, 'approve']);
        Route::post('/borrows/{borrow}/reject',        [BorrowController::class, 'reject']);

        // Books CRUD
        Route::apiResource('/books', AdminController::class);

        // Members CRUD
        Route::get('/members',                         [AdminController::class, 'members']);
        Route::post('/members',                        [AdminController::class, 'storeMember']);
        Route::put('/members/{member}',                [AdminController::class, 'updateMember']);
        Route::delete('/members/{member}',             [AdminController::class, 'destroyMember']);

        // Reports
        Route::get('/reports/summary',                 [AdminController::class, 'reportSummary']);
    });

});
