package com.jian.query;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(scanBasePackages="com.jian")
@EnableAutoConfiguration
public class App {
	
	public static String rootPath = "";
	
	public static void main(String[] args) throws Exception {
		rootPath = App.class.getResource("/").getPath().replace("/target/classes/", "/");
    	System.out.println(rootPath);
        SpringApplication.run(App.class, args);
    }
	
}
