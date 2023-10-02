import client from "../db/conn.mjs";

export const getAdmins = () =>{
    try{
        return client.query(`
            select Admin {
                id,
                first_name,
                last_name,
                username
            };
        `)
    }catch(err){
        console.log(err);
    }
}

export const saveAdmin = async (adminData) => {
    console.log(adminData);
    try{
        await client.execute(`
            insert User{
                telegram_id := <int64>$userId,
                first_name := <str>$firstName,
                last_name := <str>$lastName,
                role_type := <str>$roleType,
                created_at := <datetime>$createdAt,
                updated_at := <datetime>$updatedAt,
            };
        `,{
            userId: adminData.user_id,
            firstName:  adminData.first_name,
            lastName: adminData.last_name,
            roleType: "admin",
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        return {message: "O admin foi cadastrado com sucesso!", status: 200}
    }catch(err){
        console.log(err);
        return {message: "Tivemos um problema!", status: 500}
    }
}