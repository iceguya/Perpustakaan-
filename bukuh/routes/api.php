<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\{
    AuthController, BookController, BorrowController,
    AttendanceController, ReadController, AdminController
};

Route::get('/ping', fn() => response()->json([
    'message'=>'Backend up',
    'client'=>'react-ready'   // “Tampilkan route API tim untuk menandakan kita menggunakan react”
]));

// Auth
Route::post('/login', [AuthController::class,'login']);
Route::post('/register', [AuthController::class,'register']); // optional

// Public books search
Route::get('/books', [BookController::class,'index']);
Route::get('/books/{book}', [BookController::class,'show']);

// Protected
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class,'logout']);
    Route::get('/me', [AuthController::class,'me']);

    // user features
    Route::post('/borrow', [BorrowController::class,'store']);
    Route::post('/borrow/{borrow}/return', [BorrowController::class,'returnBook']);
    Route::get('/my/borrows', [BorrowController::class,'myBorrows']);

    Route::post('/attendance', [AttendanceController::class,'checkin']);
    Route::post('/read/progress', [ReadController::class,'updateProgress']);
    Route::get('/read/history', [ReadController::class,'history']);

    // admin features
    Route::middleware('can:isAdmin')->group(function () {
        Route::apiResource('admin/books', AdminController::class);  // CRUD buku
        Route::get('admin/borrows', [BorrowController::class,'index']);
        Route::get('admin/members', [AdminController::class,'members']);
        Route::post('admin/members', [AdminController::class,'storeMember']);
        Route::put('admin/members/{member}', [AdminController::class,'updateMember']);
        Route::delete('admin/members/{member}', [AdminController::class,'destroyMember']);
        Route::get('admin/reports/summary', [AdminController::class,'reportSummary']);
    });
});
