<script>
    //export the elements that have to be called from the app.svelte
    export let data; 
    export let day;
    export let menstruation;
</script>
<style>

    .fecha {
        width: 20%;
        float: left;
        padding-top: 100px;


    }
    .fecha p {
        color:white;
		 font-size: 1.3em;
		 font-family: OpenSans, Helvetica;
		 margin: 0px;
		 font-weight: 100;
         line-height:1.5em;
    }
    .fecha h1 {
        color:white;
		 font-size: 1.5em;
		 font-family: Roboto Slab, Helvetica;
		 margin: 0px;
		 font-weight: 600;  
    }
   
</style>
<div class="fecha">
    <h1>{day}</h1>
    <p>{menstruation}</p>

    <p>{data}</p>

    
    
</div>