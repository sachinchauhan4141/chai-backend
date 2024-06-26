import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body
    
    if(!name || !description){
        throw new ApiError(400,"all fields are required")
    }

    const playlist = await Playlist.create({
        name,
        description,
        owner:req.user._id
    })

    return res
    .status(200)
    .json(
    new ApiResponse(
            200, 
            playlist,
            "Playlist created successfully"
        )
    )
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    //TODO: get user playlists
    const playlists = await Playlist.find({owner:userId});

    return res
    .status(200)
    .json(
    new ApiResponse(
            200, 
            playlists,
            "Playlists fetched successfully"
        )
    )
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id
    const playlist = await Playlist.findById(playlistId);

    return res
    .status(200)
    .json(
    new ApiResponse(
            200, 
            playlist,
            "Playlist fetched successfully"
        )
    )
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    const playlist = await Playlist.findByIdAndUpdate(
        playlistId,{ 
        $push: { videos: videoId } 
        },
        {new:true}
    );

    return res
    .status(200)
    .json(
    new ApiResponse(
            200, 
            playlist,
            "video added to playlist successfully"
        )
    )
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    const playlist = await Playlist.findByIdAndUpdate(
        playlistId,{ 
        $pull: { videos: videoId } 
        },
        {new:true}
    );

    return res
    .status(200)
    .json(
    new ApiResponse(
            200, 
            playlist,
            "video removed from playlist successfully"
        )
    )
})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist
    const playlist = await Playlist.findByIdAndDelete(playlistId);

    return res
    .status(200)
    .json(
    new ApiResponse(
            200, 
            playlist,
            "Playlist deleted successfully"
        )
    )
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist

    if(!name || !description){
        throw new ApiError(400,"all fields are required")
    }

    const playlist = await Playlist.findByIdAndUpdate(playlistId,{
        $set:{
            name,
            description
        }
    },{
        new:true
    })

    return res
    .status(200)
    .json(
    new ApiResponse(
            200, 
            playlist,
            "Playlist updated successfully"
        )
    )
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}
