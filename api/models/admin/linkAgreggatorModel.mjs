import client from '../../db/conn.mjs';

class LinkAgreggatorModel{

    async saveLink(linkData){
        try{
            await client.execute(`insert Links{
                name := <str>$name,
                url := <str>$url
            }`,
            {
                name: linkData.name,
                url: linkData.url
            });

            return {message: "Link Salvo!", status: 200}

        }catch(err){
            return {message: "Tivemos um problema", status: 500};
        }
    }

    async getLinks(){
        try{
            const links = await client.query(`
                select Links {*};
            `);

            return links;
        }catch(err){
            console.log(err);
        }
    }

    deleteLink(linkId){
        try{
            client.execute(`
                delete Links filter .id = <uuid>$id
            `,{
                id: linkId,
            })
        }catch(err){
            console.log(err);
        }
    }

}

export default LinkAgreggatorModel;