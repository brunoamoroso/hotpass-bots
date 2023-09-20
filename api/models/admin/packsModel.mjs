import client from '../../db/conn.mjs';

export const savePack = async (packData) =>{
    try{
        await client.execute(`
            with
                content_data := <json>$content,
            insert Packs{
                media_preview := <str>$media_preview,
                media_preview_type := <str>$media_preview_type,
                description := <str>$description,
                price := <str>$price,
                content := (
                    for item in json_array_unpack(content_data) union (
                        insert Content{
                            media_id := <str>item['media'],
                            media_type := <str>item['type']
                        }
                        unless conflict on .media_id
                        else (
                            select Content {*} filter .media_id = <str>item['media']
                        )
                    )
                ),
                status := <str>$status,
                who_created := (
                    select User filter .telegram_id = <int64>$telegram_id
                ),
                created_at := <datetime>$created_at,
                updated_at := <datetime>$updated_at,
            }
        `,{
            media_preview: packData.mediaPreview,
            media_preview_type: packData.mediaPreviewType,
            description: packData.description,
            price: packData.price,
            content: packData.content,
            status: "enabled",
            telegram_id: packData.user_id,
            created_at: new Date(),
            updated_at: new Date()
        });

        return {message: "Pack Salvo!", status: 200}
    }catch(err){
        return {message: "Tivemos um problema ao salvar seu Pack!", status: 500}
    }
}

export const getPacks = () => {
    return client.query(`
    select Packs {
        media_preview,
        media_preview_type,
        description,
        price,
        content: {
            media_type,
            media_id,
        }
    };`);
}