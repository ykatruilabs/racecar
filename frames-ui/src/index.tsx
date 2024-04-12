import { Button, Frog, TextInput, parseEther } from "frog";
import { devtools } from "frog/dev";
import { serveStatic } from "frog/serve-static";
// import { neynar } from 'frog/hubs'

import { createClient } from "@supabase/supabase-js";
import { getUserDataForFid, getAddressForFid } from "frames.js";


// Create a single supabase client for interacting with your database
const supabase = createClient("https://ojvozirqgxgiztlmasrm.supabase.co", "");

function generateColor() {
  // Generate a random number between 0 and 1
  const randomNumber = Math.random();
  // If randomNumber is less than 0.5, return 'blue', otherwise return 'white'
  return randomNumber < 0.5 ? "blue" : "white";
}

const getEnded = (c) => {
  return c.res({
    image: <div
    tw="flex w-full h-full bg-white justify-center items-center flex-col text-black"
  >
    <p tw="text-7xl font-bold">Ended</p>
      
    <div tw="mt-[40px] text-5xl font-bold">Check your Prize</div>
  </div>,
    intents: [<Button action="/mint" value="yes">
    Check
  </Button>]
  });
}

class Racecar {
  frame_id = "lambo";

  constructor(frame_id) {
    this.frame_id = frame_id ? frame_id : "lambo";
  }

  track = async (c, event) => {

    if(c?.frameData){

      // const { castId, fid, messageHash, url } = frameData;
    
        const userData = await getUserDataForFid({ fid: c?.frameData?.fid });
        const address = await getAddressForFid({ fid: c?.frameData?.fid });
    
        // console.log('track',userData, address)
        await supabase.from("user_frame_data").insert({
          frame_user_id: c?.frameData?.fid,
          cast_id: c?.frameData?.castId,
          message_hash: c?.frameData?.messageHash,
          url: c?.frameData?.url,
          frame_user_address: address,
          results: event,
          frame_id: this.frame_id,
          frame_user_name: userData?.username,
          frame_user_display_name: userData?.displayName,
          frame_profile_picture: userData?.profileImage,
        });
    }


  };
}

const racecar = new Racecar();

export const app = new Frog({
  assetsPath: "/",
  basePath: "/api",
  imageAspectRatio: "1:1",
  imageOptions: {
    width: 600,
    height: 600,
    format: "png",
    // fonts: [
    //   // name: 'Typewriter',
    //   // data: fontData,
    //   // style: 'normal',
    // ]
  },
  // Supply a Hub to enable frame verification.
  // hub: neynar({ apiKey: 'NEYNAR_FROG_FM' })
});

const checkMintStart = async () => {

  let {data} = await supabase.from('config').select().eq('name', 'MINT_STARTED').single()
  // console.log(data)
  if(data){
    return data.value == 'true'
  }


}

app.frame("/", async (c) => {
  
  let mintStart = await checkMintStart()

  await racecar.track(c, {
    event: "init",
  });

  if(!mintStart){

    let { data: leaderboard_data } = await supabase.rpc("get_user_ranks");
  
    // check if my fid is in the leaderboard data.
  
    let fid = c?.frameData?.fid;
    let has_rank = false;
  
    if(leaderboard_data?.length > 0){
      let _rank = leaderboard_data.find((entry) => entry.fid == fid);
      if(_rank){
        has_rank = true;
      }
    }
  
    let buttons = []
  
    if(has_rank){
      buttons = [<Button action="/leaderboard" value="yes">
      Start
    </Button>]
    } else{
      buttons = [<Button action="/intro" value="yes">
      Start
    </Button>]
    }
  
  
  
  
    return c.res({
      image: <div
      tw="flex w-full h-full bg-black justify-center items-center flex-col text-white"
    >
      <p tw="text-7xl font-bold">RACECAR</p>
        
      <div tw="mt-[40px] text-5xl font-bold">Join Now</div>
    </div>,
      intents: buttons
    });
  } else{

    return getEnded(c)

  }


})

app.frame("/intro", async (c) => {
  let color = generateColor();

  await racecar.track(c, {
    event: "intro",
    option: color,
  });

  const getCover = () => {
    if (color == "blue") {
      return (
        <div tw="flex w-full h-full bg-blue-500 justify-center items-center flex-col text-white">
          <p tw="text-7xl font-bold">RACECAR</p>

          <div tw="flex mt-[40px] text-3xl font-bold">Like, Comment For points</div>
        </div>
      );
    }
    if (color == "white") {
      return (
        <div tw="flex w-full h-full bg-white justify-center items-center flex-col text-blue-500">
          <p tw="text-7xl font-bold">RACECAR</p>

          <div tw="flex mt-[40px] text-3xl font-bold">Like, Comment For points</div>
        </div>
      );
    }
  };

  return c.res({
    image: <div tw="flex justify-center items-center w-full h-full">{getCover()}</div>,
    intents: [
      <Button action="/leaderboard" value="yes">
        Start
      </Button>,
      <Button action="/" value="no">
        Cancel
      </Button>,
    ],
  });
});


app.frame("/leaderboard", async (c) => {
  // console.log(c)

  let mintStart = await checkMintStart()

  if(!mintStart){
    const { buttonValue } = c;
    // console.log(c)
  
    await racecar.track(c, {
      event: "view_leaderboard",
      option: buttonValue,
    });
  
    let { data: leaderboard_data } = await supabase.rpc("get_user_ranks");
  
    console.log(leaderboard_data);
    const userData = await getUserDataForFid({ fid:c.frameData.fid });
  
    let myRank = {
      rank: 'none',
      points: 0,
      username: userData?.displayName
    };
  
    if(leaderboard_data?.length > 0){
      let _rank = leaderboard_data.find((entry) => entry.fid == c.frameData.fid);
      if(_rank){
        myRank = _rank;
      }
    } else{
      for(let i=0;i<5;i++){
        leaderboard_data.push({
          username: 'No User',
          points: ''
        })
      }
    }
  
    if (leaderboard_data.length < 5) {
      // fill the rest of the leaderboard with empty data
  
      for (let i = leaderboard_data.length; i < 5; i++) {
        leaderboard_data.push({
          username: "No User",
          points: "",
        });
      }
    }
  
    const rankStyles = [
      { bg: "bg-yellow-300", text: "text-yellow-600" }, // Gold
      { bg: "bg-gray-200", text: "text-gray-400" }, // Silver
      { bg: "bg-[#cd7f32]", text: "text-white" }, // Bronze
    ];
  
    const renderLeaderboardEntries = () => {
      let first_5 = leaderboard_data.slice(0, 5);
  
      return first_5.map((entry, index) => {
        const style = rankStyles[index] || { bg: "bg-transparent", text: "text-black" };
        return (
          <div key={index} tw={`flex border-b border-b-zinc-200 px-4 py-4 pb-4 ${index == 4 ? "" : "mb-2"}`}>
            <div tw="flex justify-center items-center w-[12%]">
              <div tw={`rounded-full ${style.bg} w-8 h-8 flex justify-center items-center`}>
                <div tw={`font-bold ${style.text} flex`}>{index + 1}</div>
              </div>
            </div>
            <div tw="flex justify-start pl-4 items-center w-[70%]">{entry?.username}</div>
            <div tw="flex justify-end items-center w-[20%]">{entry.points}</div>
          </div>
        );
      });
    };
  
    const renderMyScore = () => {
      return (
        <div tw="flex bg-gray-100 px-4 justify-between items-center flex-grow">
          <div tw="flex flex-col justify-center items-start w-[50%]">
            <div tw="flex">You</div>
            <div tw="flex text-lg font-bold">{myRank?.username}</div>
          </div>
  
          <div tw="flex flex-col justify-center items-center">
            <div tw="flex text-sm">RANK</div>
            <div tw="flex font-bold">#{myRank?.rank}</div>
          </div>
  
          <div tw="flex flex-col justify-center items-center">
            <div tw="flex text-sm">PTS</div>
            <div tw="flex font-bold">{myRank?.points}</div>
          </div>
        </div>
      );
    };
  
    return c.res({
      image: (
        <div tw="flex flex-col w-full h-full items-center justify-start bg-white">
          <div tw="flex flex-col w-full h-full">
            <div tw="flex flex-col">
              <h1 tw="px-4">Leaderboard</h1>
  
              <div tw="flex flex-col">
                <div tw="flex mb-2 px-4 pb-4">
                  <div tw="flex justify-center items-center w-[12%] text-sm font-bold bg-indigo-500 rounded-md p-1 text-white">RANK</div>
  
                  <div tw="flex justify-start pl-4 items-center w-[70%] font-bold">Name</div>
  
                  <div tw="flex justify-end items-center w-[18%] text-sm font-bold">Pts</div>
                </div>
  
                {renderLeaderboardEntries()}
              </div>
            </div>
  
            {renderMyScore()}
          </div>
        </div>
      ),
      intents: [
        <Button action="/leaderboard" value="yes">
          Refresh
        </Button>
      ],
    });

  } else{
    return getEnded(c)
  }
});

app.frame("/mint", async (c) => {

  await racecar.track(c, {
    event: "mint",
  });

  let { data: leaderboard_data } = await supabase.rpc("get_user_ranks");

  let fid = c?.frameData?.fid;

  
  // get my rank
  
  let myRank = leaderboard_data.find((entry) => entry.fid == fid);
  console.log(leaderboard_data, myRank)

  let reward = 0.001

  if(myRank?.rank == 1){
    reward = 0.02 
  }

  else if(myRank?.rank == 2){
    reward = 0.01
  }

  else if(myRank?.rank == 3){
    reward = 0.005
  }

  const renderNameTag = (myRank) => {
    return <div tw="flex bg-white p-2 pl-4 rounded-xl justify-between items-center">
    <div tw="flex flex-col justify-start items-start mr-8">
      <span tw="flex text-2xl font-bold  ">{myRank?.username}</span>
      <span tw="flex">{myRank?.points} point</span>
    </div>

    <div tw="w-20 h-20 bg-blue-500 rounded-xl text-white flex justify-center items-center font-bold text-3xl"># {myRank?.rank}</div>
  </div>
  }

  return c.res({
    image: <div
    tw="flex w-full h-full bg-blue-200 justify-center items-center flex-col text-blue-800"
  >
    <p tw="text-4xl font-bold">reward</p>
      
    <div tw="flex text-6xl font-bold">{reward} ETH</div>
  
    <div tw="flex text-3xl font-bold mt-12">🔵 🔵 🔵</div>
  
    <div tw="flex p-2 mt-8">
    {renderNameTag(myRank)}
    </div>
  
    <p tw="text-2xl mt-4">Thank you for your engagement!</p>
  
  
  </div>,
    intents: [
      <Button.Transaction target={`/claim/${String(reward)}`}>Claim</Button.Transaction>
    ]
  });

    
})

app.transaction('/claim/:reward', async (c) => {

  const { reward } = c.req.param();
  let rewardWei = BigInt(Number(reward)*10**18)
  return c.contract({
    abi:[
      {
        "inputs": [],
        "stateMutability": "nonpayable",
        "type": "constructor"
      },
      {
        "inputs": [],
        "name": "EnforcedPause",
        "type": "error"
      },
      {
        "inputs": [],
        "name": "ExpectedPause",
        "type": "error"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "owner",
            "type": "address"
          }
        ],
        "name": "OwnableInvalidOwner",
        "type": "error"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "account",
            "type": "address"
          }
        ],
        "name": "OwnableUnauthorizedAccount",
        "type": "error"
      },
      {
        "inputs": [],
        "name": "ReentrancyGuardReentrantCall",
        "type": "error"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "previousOwner",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "newOwner",
            "type": "address"
          }
        ],
        "name": "OwnershipTransferred",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "internalType": "address",
            "name": "account",
            "type": "address"
          }
        ],
        "name": "Paused",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "internalType": "address",
            "name": "account",
            "type": "address"
          }
        ],
        "name": "Unpaused",
        "type": "event"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "name": "balanceOf",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "name": "hasClaimed",
        "outputs": [
          {
            "internalType": "bool",
            "name": "",
            "type": "bool"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          }
        ],
        "name": "mint",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "owner",
        "outputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "pause",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "paused",
        "outputs": [
          {
            "internalType": "bool",
            "name": "",
            "type": "bool"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "renounceOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "newOwner",
            "type": "address"
          }
        ],
        "name": "transferOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "unpause",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address[]",
            "name": "_account",
            "type": "address[]"
          },
          {
            "internalType": "uint256[]",
            "name": "_quantity",
            "type": "uint256[]"
          }
        ],
        "name": "whitelist",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "withdraw",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "stateMutability": "payable",
        "type": "receive"
      }
    ],
    chainId: 'eip155:8453',
    functionName: 'mint',
    args: [rewardWei],
    to: '0xef23715f95a362ff70a7a7026536add3521cbb1c'
  })

})

const isCloudflareWorker = typeof caches !== 'undefined'
if (isCloudflareWorker) {
  const manifest = await import('__STATIC_CONTENT_MANIFEST')
  const serveStaticOptions = { manifest, root: './' }
  app.use('/*', serveStatic(serveStaticOptions))
  devtools(app, { assetsPath: '/frog', serveStatic, serveStaticOptions })
} else {
  devtools(app, { serveStatic })
}

export default app
