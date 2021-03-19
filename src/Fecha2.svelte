<script>
    //export the elements that have to be called from the app.svelte
    export let data;
</script>
<style>
  .fecha p {
        color:white;
		 font-size: 0.7em;
		 font-family: OpenSans, Helvetica;
		 margin: 0px;
		 font-weight: 100;
         line-height:1.5em;
         padding-bottom:5px;
         
    }
</style>
<div class="fecha">
    <p>{data}</p></div>


    
