let currentSong = new Audio();
let songs;
let currFolder;

const currplay = document.getElementById("currplay");

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}



async function getSongs(folder) {
    currFolder = folder
    let a = await fetch(`http://127.0.0.1:5500/${folder}/`)
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3"))
            songs.push(element.href.split(`/${folder}/`)[1]);
    }

    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0]
    songUL.innerHTML = ""
    for (const song of songs) {
        let cleanName = decodeURIComponent(song)
            .replace(/\[.*?\]/g, "") // removes [NCS Release] or similar
            .trim();
        songUL.innerHTML = songUL.innerHTML + `<li> 
        
                         
                            <div class="info">
                                <div>${cleanName}</div>
                            </div>
                            <div class="playnow">
                                <span>Play now</span>
                                <img class="invert" src="play.svg" alt="">
                            </div>
        </li>`;
    }

    // let audio;
    // if (songs.length > 0) {
    //     audio = new Audio(songs[0]);
    //     try {
    //         audio.play();
    //     } catch (err) {
    //         console.error("Audio play failed:", err);
    //     }
    // } else {
    //     console.log("No songs found.");
    // }

    // Attach an event listener to each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e=>{
        e.addEventListener("click", element=>{
            console.log(e.querySelector(".info").firstElementChild.innerHTML);
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
        })
    })
}

const playMusic = (track, pause=false)=>{
    // let audio = new Audio("/songs/" + track)

    currentSong.src = `/${currFolder}/` + track
    if(!pause)
    {
        currentSong.play()
        currplay.src = "pause.svg"
    }

    document.querySelector(".songinfo").innerHTML = track
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"

    
}

async function main() {

    // Get the list of all songs
    await getSongs("songs/ncs");
    playMusic(songs[0],true)

    // Show all the songs
    


    // Attach an event listener to previous,currplay and next
    currplay.addEventListener("click", ()=>{
        if(currentSong.paused){
            currentSong.play()
            currplay.src = "pause.svg"
        }
        else{
            currentSong.pause()
            currplay.src = "play.svg"
        }
    })


    // Listen for time update event
    currentSong.addEventListener("timeupdate", ()=>{
        document.querySelector(".songtime").innerHTML = `${formatTime(currentSong.currentTime)}/${formatTime(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    })


    // Add event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", (e)=>{
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100
        document.querySelector(".circle").style.left = percent + "%"
        currentSong.currentTime = ((currentSong.duration) * percent) / 100
    })

    document.querySelector(".hamberger").addEventListener("click", ()=>{
        document.querySelector(".left").style.left = "0"
    })


    // Add event listener for close button
    document.querySelector(".close").addEventListener("click", ()=>{
        document.querySelector(".left").style.left = "-120%"
    })


    // Add event listener to previous and next
    previous.addEventListener("click", ()=>{
       
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        // console.log(songs, index)
        if((index-1) >= 0) {
            playMusic(songs[index-1])
        }
    })

    next.addEventListener("click", ()=>{

        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        // console.log(songs, index)
        if((index+1) < songs.length) {
            playMusic(songs[index+1])
        }
    })


    // Add event to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e)=>{
        // console.log(e, e.target, e.target.value)
        currentSong.volume = parseInt(e.target.value) / 100
    })


    // Load the playlist when card is clicked
    Array.from(document.getElementsByClassName("card")).forEach( e=>{
        e.addEventListener("click", async item=>{
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
        })
    })

}
main();
