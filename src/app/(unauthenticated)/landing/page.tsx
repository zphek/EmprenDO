export default function Page(){
    return <main>
        <section className="p-10">
            <div>
                <h2 className="text-4xl">Impulsa sueños, transforma realidades, apoya a EmprenDO</h2>
                <p>EmprenDO es una plataforma de crowdfunding que conecta emprendedores con mentores e inversionistas para convertir ideas en negocios sostenibles.</p>
                
                <button>
                    Conoce a EmprenDO
                </button>

                <div>
                    <div>
                        <h1>200+</h1>
                        <h4>Inversionistas</h4>
                    </div>

                    <div>
                        <h1>2000+</h1>
                        <h4>Mentores</h4>
                    </div>
                    
                    <div>
                        <h1>3000+</h1>
                        <h4>Emprendedores</h4>
                    </div>
                </div>
            </div>

            <div>
                
            </div>
        </section>

        <section>
            <h2>El éxito de tu emprendimiento empieza aquí</h2>

            <div className="grid grid-cols-3 gap-x-5">
                <div className="bg-slate-300 rounded-md">
                    <div>
                        <div className="h-10 w-10 rounded-full bg-slate-300">

                        </div>

                        <div>
                            <h2>Laura S&acute;nchez</h2>
                            <h6>Administraci&oacute;n de empresas</h6>
                        </div>
                    </div>

                    <p>&quot;Me inspira ayudar a convertir ideas en negocios exitosos.&quot;</p>
                </div>

                <div className="bg-slate-300 rounded-md">
                    <div>
                        <div className="h-10 w-10 rounded-full bg-slate-300">

                        </div>

                        <div>
                            <h2>Laura S&acute;nchez</h2>
                            <h6>Administraci&oacute;n de empresas</h6>
                        </div>
                    </div>

                    <p>&quot;Me inspira ayudar a convertir ideas en negocios exitosos.&quot;</p>
                </div>

                <div className="bg-slate-300 rounded-md">
                    <div>
                        <div className="h-10 w-10 rounded-full bg-slate-300">

                        </div>

                        <div>
                            <h2>Laura S&acute;nchez</h2>
                            <h6>Administraci&oacute;n de empresas</h6>
                        </div>
                    </div>

                    <p>&quot;Me inspira ayudar a convertir ideas en negocios exitosos.&quot;</p>
                </div>
            </div>

            <div>
                <div>
                    Conoce las mentorias

                    <button className="bg-red-500 rounded-full p-5">
                        {">"}
                    </button>
                </div>
            </div>
        </section>

        <section>
            <h2>Testimonios y casos de &eacute;xito</h2>
        </section>
    </main>
}