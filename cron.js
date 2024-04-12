
const axios = require("axios");
const { createClient } = require('@supabase/supabase-js');

const server = "https://nemes.farcaster.xyz:2281";
const init_timestamp = 1609459200;

(async () => {



    const getUserData = async (_fid) => {
        const url = `${server}/v1/userDataByFid?fid=${_fid}&user_data_type=6`
        const response = await axios.get(url);
        // console.log(response.data.data.userDataBody.value);
        return response.data.data.userDataBody.value;
    }

    const supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_ANON_KEY
    )

    const fid = process.env.TARGET_FID;
    const cast_hash = process.env.TARGET_HASH;



    try {

        setInterval( async () => {

            const url = `${server}/v1/castsByParent?fid=${fid}&hash=${cast_hash}`
            console.log(url);
            const response = await axios.get(url)


            for(let message of response.data.messages) {

                // console.log(message)
                const cast_body_data = message.data;
                console.log(cast_body_data);

                const message_user_fid = cast_body_data.fid;
                const mentioned_user_fid = cast_body_data.castAddBody.mentions;
                const message_text = cast_body_data.castAddBody.text;
                const message_timestamp = cast_body_data.timestamp + init_timestamp;

                const userName = await getUserData(message_user_fid);
                console.log(userName);

                // 2 point
                const commentPayload = {
                    "user_fid": message_user_fid,
                    "point": 2,
                    "type": "comment",
                    "remark": `${message_text}_${message_timestamp}`,
                    "hash": message.hash,
                    'username': userName,
                    'cast_hash': cast_hash,
                }

                const ap = await supabase.from('user_frame_comments').upsert(commentPayload, { onConflict: ['user_fid', 'type', 'remark', 'cast_hash'] }).select()
                // console.log(ap)

                // 10 point
                for(let mention of mentioned_user_fid) {

                    const mentionPayload = {
                        "user_fid": message_user_fid,
                        "point": 10,
                        "type": "mention",
                        "remark": `${mention}_${message_timestamp}`,
                        "hash": message.hash,
                        'username': userName,
                        'cast_hash': cast_hash,
                    }

                    const be = await supabase.from('user_frame_comments').upsert(mentionPayload, { onConflict: ['user_fid', 'type', 'remark', 'cast_hash'] }).select()
                    // console.log(be);

                }


            }


        }, 2000)


    } catch (e) {
        // Handle errors
        console.log(e);
    }




})();