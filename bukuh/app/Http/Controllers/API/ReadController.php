<?php
namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\ReadProgress;
use Illuminate\Http\Request;

class ReadController extends Controller
{
    public function updateProgress(Request $r)
    {
        $data = $r->validate([
            'member_id'=>'required|exists:members,id',
            'book_id'=>'required|exists:books,id',
            'current_page'=>'required|integer|min:0',
            'total_pages'=>'required|integer|min:1'
        ]);

        $rp = ReadProgress::updateOrCreate(
            ['member_id'=>$data['member_id'],'book_id'=>$data['book_id']],
            ['current_page'=>$data['current_page'],'total_pages'=>$data['total_pages']]
        );
        return $rp;
    }

    public function history(Request $r)
    {
        return ReadProgress::with('book')->latest()->paginate(20);
    }
}
