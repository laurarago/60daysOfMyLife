<script>
	export let dades; //call data
	import Menstrual from "./Menstrual.svelte"; //import the svgs with conditionals
	import Fecha from "./Fecha.svelte"; //import the date module for calendar view
	import Fecha2 from "./Fecha2.svelte"; //import the date module for day by day view
	import Scroller from '@sveltejs/svelte-scroller'; //import svelte-scroller
	let index = 0, offset, progress ; //create variable index, offset and progress for svelte-scroller to work

	//import images for the legends
	let menstruation = "img-02.png";
	let preovulation = "img-03.png";
	let ovulation = "img-04.png";
	let premenstruation = "img-04.png";
	let legend = "LEGEND-01.png"

	//required script for toogle button to work
	let user = { loggedIn: false };

	function toggle() {
		user.loggedIn = !user.loggedIn;
	}	
 </script>
 <style>
	 @import url('https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap');
	 @import url('https://fonts.googleapis.com/css2?family=Katibeh&family=Roboto+Slab:wght@100;200;300;400;500;600;700;800;900&display=swap');
	 @import url('https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400;1,700&display=swap');
	
	 main {
		font-family: Roboto, sans-serif;
		text-align: center;
		background-color: #212121;
		margin: 0px;
	}
	.EachDay {
		width: 100%;
		overflow: auto;
		border-color: white solid 1px;

	}
	section { 
		margin: 0px;
	
	}
	h1 {
		color:white;
		font-size: 7em;
		font-family: Roboto Slab, Helvetica;
		margin: 0px;
		padding-top: 7%;
		line-height: 0.8em;
		letter-spacing: -9px;
		font-weight: 400;
	}
	 h2 {
		color:white;
		font-size: 1.3em;
		font-family: OpenSans, Helvetica;
		margin: 0px;
		padding-top: 7%;
		font-weight: 200;
	}
	 h3 {
		color:white;
		font-size: 2em;
		font-family: Roboto Slab, Helvetica;
		margin: 0px;
		padding-top: 7%;
		line-height: 0.8em;
		font-weight: 400;
	}
	p {
		color:white;
		font-size: 1em;
		line-height: 1.5em;
		font-family: Roboto Slab, Helvetica;
		font-weight:200; 

	}
	 .expl {
		padding-right: 30%;
		padding-left: 30%;
		text-align:left;
		padding-bottom:0px;
		margin-bottom:0px;

	}
	.legend {
		padding-right: 15%;
		padding-left:15%;
		padding-top:0px;
	}

	.figure {
		margin-left: 15%;

	}
	table {
		width:100%;
		color:white;
		font-size: 1em;
		font-family: OpenSans, Helvetica;
		font-weight:100;

		 
	}
	th {
		display: table-cell;
		vertical-align: inherit;
		font-weight: 100;
		text-align: -internal-center;
	}
	.titulo {
		padding-bottom: 7%;
	}
	.calendarView{
		margin-right:15%;
		margin-left:15%;
	}
	.fech{
		width: "150px;";
		display:inline-block;
		text-align:center;
		z-index:10;
	}
 </style>
 
 <main>
<!-- title, explanations and legends -->
<div class="intro">
	<div class="expl">
		<h1>Life is a roller <br> coaster</h1>
		<h2 style="margin-bottom:0px; padding-bottom:0px;">PUTTING EMOTIONS AT THE CENTER DURING 60 DAYS</h2>
		<p>We live in a society that operates at a very high rate of production, even in the midst of a global pandemic. And eventhough we try to do the same job every day, we are not always an homogeneous version of ourselves. This work is puts the emotional ups and downs at the center to see how we fluctuate between moods. And how these changes are cause and consequence at the same time of the different stages of the menstrual cycle.</p>
		</div>	
	<div class='legend'>
		<h2>HOW TO READ THE CHART</h2>
		<p>Each shape represents one different stage of the period cycle</p>
		<table class="table">
			<tbody>
			  <tr>
				<th>MENSTRUATION</th>
				<th>PREOVULATION</th>
				<th>OVULATION</th>
				<th>PREMENSTRUAL</th>
			  </tr>
			
			  <tr>
				<th><img src={menstruation} width="70px;" alt="menstruation"/></th>
				<td><img src={preovulation} width="70px;" alt="preovulation"/></td>
				<td><img src={ovulation} width="70px;" alt="ovulation"/></td>
				<td><img src={premenstruation} width="70px;" alt="premenstruation"/></td>
			  </tr>
			  </tbody>
			  </table>
		<p style="padding-top:4%;">The colors represent the main feeling of the day</p>
		<table class="table">
			<tbody>
			  <tr>
				<th height="30px;" style="background-color:#ffce00;">ECSTACY</th>
				<th height="30px;" style="background-color:#0269b3">GRIEF</th>
				<th height="30px;" style="background-color:#53136d">TERROR</th>
				<th height="30px;" style="background-color:#cc0000">RAGE</th>
			  </tr>
			
			  <tr>
				<th height="30px;" style="background-color:#ffde80;color:#212121">JOY</th>
				<td height="30px;" style="background-color:#7ea4d9;color:#212121">SADNESS</td>
				<td height="30px;" style="background-color:#a375b3;color:#212121">FEAR</td>
				<td height="30px;" style="background-color:#ed6464;color:#212121">ANGER</td>
			  </tr>
			  <tr>
				<th height="30px;" style="background-color:#f9edb4;color:#212121">SERENITY</th>
				<td height="30px;" style="background-color:#d1e3ff;color:#212121">PENSIVENESS</td>
				<td height="30px;" style="background-color:#f4dafc;color:#212121">APPRENSION</td>
				<td height="30px;" style="background-color:#ffcccc;color:#212121">ANNOYANCE</td>
			  </tr>
			  </tbody>
			  </table>
		<p style="padding-top:4%;">The composition represent the current day and feelings of the two last days</p>
		<img src={legend} width="60%" alt="legend"/>
	</div>
	<div class=titulo>
		<h3>EXPLORE THE 60 DAYS UPS AND DOWNS</h3>
</div>
<!-- add the button if to show different distributions -->
{#if user.loggedIn} <!-- if statement to switch views when click -->
	<!-- The next lines detail the calendar view -->
	<button on:click={toggle}>CALENDAR VIEW</button> 
	<div class="calendarView"> <!-- create a div for the calendar view -->
		<!-- use #each statement to create a shape for each row of our data called dades -->
		{#each dades as d }
			<div class="fech"> <!-- create a div for each svg -->
			<Fecha2 data = {d.Fecha}/> <!-- Embed all the Fecha2 element to add the date information -->
			<!-- create the svg content for each day -->
			<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 1313.56 1346.17" width="150px" >
				<!-- Embed the menstrual element to add he svg polygons -->
				<Menstrual PeriodCycle = {d.PeriodCycle}
						Level = {d.Level}
						ColorPYest = {d.PastYestColor}
						ColorYest = {d.YestColor}
						Color1 = {d.Stage1Color} 
						Color2 = {d.Stage2Color} 
						Color3 = {d.Stage3Color} 
						Tooltip1Feeling = {d.Tooltip1Feeling}
						Tooltip2Feeling = {d.Tooltip2Feeling}
						Tooltip3Feeling = {d.Tooltip3Feeling}/>
			</svg>
			</div>
		{/each}
	</div>
{:else}
<!-- The next lines detail the day by day view -->
	<button on:click={toggle}>DAY BY DAY</button>
	<br><br> <!-- Ugly and quick way to add space -->
	<Scroller top={0.2} bottom={0.8} bind:index bind:offset bind:progress> <!-- Use scroller to create an effect while scrolling-->
		<!-- Create a div for the static date information -->
		<div class="EachDay" slot="background">  <!-- add slot "background" to specify that is going to be the static part -->
			<!-- Embed all the Fecha element to add the date information.
			Here we use dades[index].Fecha instead of d.Fecha because, we
			want to use the call the data throught the each specific section
			created with the scroller -->
			<Fecha data = {dades[index].Fecha} 
				   day = {dades[index].Day}
				   menstruation = {dades[index].PeriodCycle}/> 
		</div>
		<!-- Create a div for the dynamic shapes that will react to the scroll -->
		<div class="figure" slot="foreground"> <!-- add slot "foreground" to specify that is going to be dynamic part when scrolling -->
			<!-- use #each statement to create a shape for each row of our data called dades-->
			{#each dades as d }
			<section height="80vh"> <!-- create a section for each shape instead of a div -->
			<!-- create the svg content for each day -->
			<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 1313.56 1346.17" height="500px" >
			<!-- Embed the menstrual element to add he svg polygons -->
			<Menstrual PeriodCycle = {d.PeriodCycle}
						Level = {d.Level}
						ColorPYest = {d.PastYestColor}
						ColorYest = {d.YestColor}
						Color1 = {d.Stage1Color} 
						Color2 = {d.Stage2Color} 
						Color3 = {d.Stage3Color} 
						Tooltip1Feeling = {d.Tooltip1Feeling}
						Tooltip2Feeling = {d.Tooltip2Feeling}
						Tooltip3Feeling = {d.Tooltip3Feeling}/>
			</svg>
			</section>
			{/each}
		</div>
		</Scroller>

{/if}
</main>
