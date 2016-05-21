importPackage(java.io);

// get plugin instances
visualizer = mote.getSimulation().getCooja().getStartedPlugin("VisualizerScreenshot");
timeline = mote.getSimulation().getCooja().getStartedPlugin("Timeline");
powertracker = mote.getSimulation().getCooja().getStartedPlugin("PowerTracker");

// create log file handlers
log.log("Opening log file writers...\n");
log_serial = new FileWriter("./data/serial.log");        // open serial log file
log_rpl = new FileWriter("./data/rpl.log");           // open RPL messages log file
log_edges = new FileWriter("./data/edges.log");       // open RPL DAG log file
log_power = new FileWriter("./data/powertracker.log", false);
log_timeline = new FileWriter("./data/timeline.log", false);

// re-frame visualizer view
visualizer.resetViewport = 1;
visualizer.repaint();

// set timeout and declare variables
TIMEOUT({{ timeout }}, log.testOK());
var c = 0, i = 0, period = {{ sampling_period }};

// now, start the test
log.log("Starting stript...\n");
while(1) {
  try {
    // first, log to serial file
    line = time + "\tID:" + id.toString() + "\t" + msg + "\n"
    if (msg.startsWith("#L ")) {
      edges_serial.write(line);
      edges_serial.flush();
    } else if (msg.startsWith("RPL: ")) {
      rpl_serial.write(line);
      rpl_serial.flush();
    } else {
      log_serial.write(line);
      log_serial.flush();
    }
    YIELD();
    // then, log power statistics
    if (c < time) {
      log_power.write(powertracker.radioStatistics());
      log_power.flush();
      log_timeline.write(timeline.extractStatistics());
      log_timeline.flush();
      visualizer.takeScreenshot("./data/network_" + ("0" + i).slice(-3) + ".png", 0, 0);
      c += period;
      i += 1;
    }
  } catch (e) {
    log_serial.close();
    log_rpl.close();
    log_edges.close();
    log_power.close();
    log_timeline.close();
    log.log("File writers closed\n");
    break;
  }
}
log.log("Done.");