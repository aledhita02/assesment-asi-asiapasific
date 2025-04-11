<?php

namespace App\Http\Controllers;

use App\Models\MyClient;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Redis;


class ClientController extends Controller
{
    public function index()
    {
        $clients = MyClient::whereNull('deleted_at')->get();
        return response()->json($clients);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:250',
            'is_project' => 'required|in:0,1',
            'self_capture' => 'required|in:0,1',
            'client_prefix' => 'required|string|max:4',
            'client_logo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'address' => 'nullable|string',
            'phone_number' => 'nullable|string|max:50',
            'city' => 'nullable|string|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $data = $request->except('client_logo');
        $data['slug'] = Str::slug($request->name);

        if ($request->hasFile('client_logo')) {
            $path = $request->file('client_logo')->store('client-logos', 's3');
            $data['client_logo'] = basename($path);
        } else {
            $data['client_logo'] = 'no-image.jpg';
        }

        $client = MyClient::create($data);

        return response()->json($client, 201);
    }

    public function show($slug)
    {
        $cachedClient = Redis::get("client:{$slug}");

        if ($cachedClient) {
            return response()->json(json_decode($cachedClient));
        }

        $client = MyClient::where('slug', $slug)->whereNull('deleted_at')->firstOrFail();
        return response()->json($client);
    }

    public function update(Request $request, $id)
    {
        $client = MyClient::whereNull('deleted_at')->findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:250',
            'is_project' => 'sometimes|in:0,1',
            'self_capture' => 'sometimes|in:0,1',
            'client_prefix' => 'sometimes|string|max:4',
            'client_logo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'address' => 'nullable|string',
            'phone_number' => 'nullable|string|max:50',
            'city' => 'nullable|string|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $data = $request->except('client_logo');

        if ($request->hasFile('client_logo')) {
            // Delete old image if not default
            if ($client->client_logo !== 'no-image.jpg') {
                Storage::disk('s3')->delete("client-logos/{$client->client_logo}");
            }

            $path = $request->file('client_logo')->store('client-logos', 's3');
            $data['client_logo'] = basename($path);
        }

        $client->update($data);

        return response()->json($client);
    }

    public function destroy($id)
    {
        $client = MyClient::findOrFail($id);
        $client->delete();

        return response()->json(null, 204);
    }
}
