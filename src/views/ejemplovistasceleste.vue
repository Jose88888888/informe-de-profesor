<script setup>
    import { ref } from 'vue';
    import axios from 'axios';

    const variable=ref([]);

    async function conect(){
        const options = {
            method: 'GET',
            url: "http://localhost:3000/api/actividades/:table/:tipo",
            headers: {
            'Content-Type': 'application/json',
            },
        }
        try {
            const response = await axios.request(options)
            variable.value=response.data;
            /* response.data.forEach(element => {
                console.log(element);
            }); */
            return response.data
        }
        catch (error) {
            console.error(error)
            return [{}]
        }
    }

    conect();
</script>
<template>
    <tabla>
        <tr>
            <th style="border:black solid 1px">campo</th>
            <th style="border:black solid 1px">hora/dia</th>
            <th style="border:black solid 1px">observaciones</th>
            <th style="border:black solid 1px">archivo</th>
        </tr>
        <tr v-for="item in variable">
            <th style="border:black solid 1px">{{ item.descripcion }}</th>
            <th style="border:black solid 1px"><input type="text"/></th>
            <th style="border:black solid 1px"><input type="text"/></th>
            <th style="border:black solid 1px"><input type="file"/></th>
        </tr>
    </tabla>
    
</template>